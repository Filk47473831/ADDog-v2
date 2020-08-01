const express = require('express');
const session = require('express-session');
const https = require("https");
const bodyParser = require("body-parser");
const fs = require('fs');
const app = express();
const handlebars = require('express-handlebars');
const keytar = require("keytar");
const ldap = require('ldapjs');
const { exec } = require("child_process");
const shell = require('node-powershell');

try {
  settings = JSON.parse(fs.readFileSync('settings/settings.data'));
} catch (err) {
  settings = {
    "Settings": {
      "port":"9911",
      "cookie":"gW0VrKwbYb{[suTR2v:5s/)I-OwsR->1PZs<kHaybMb2.y",
      "privateKey":"private.pem",
      "publicKey":"public.pem",
      "account":"ADDog-API",
      "authKey":"fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9",
      "server":"",
      "baseDn":"",
      "domainFQDN":"",
      "domainUsername":"",
      "passwordMinLength":"",
      "printServer":"",
      "adSyncServer":"",
      "loginMsg":""
    }
  }
  fs.writeFileSync('settings/settings.data', JSON.stringify(settings));
}

const port = settings.Settings.port;
const key = fs.readFileSync(__dirname + '/sslcert/' + settings.Settings.privateKey);
const cert = fs.readFileSync(__dirname + '/sslcert/' + settings.Settings.publicKey);

try {
  fs.readFileSync('settings/templates.data');
} catch (err) {
  fs.writeFileSync('settings/templates.data',"{}");
}

var settingsApplied = false;
var client = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars({ layoutsDir: __dirname + '/views/layouts' }));
app.use(express.static('public'))

app.use(session({
  secret: settings.Settings.cookie,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// Save Settings

app.post('/settings',async function(req, res) {

  try {
    if (fs.existsSync('settings/settings.data')) {
      settings = JSON.parse(fs.readFileSync('settings/settings.data'));
    }
  } catch(err) {
    logError(err)
    settings = {
      "Settings": {
        "port":"9911",
        "cookie":"gW0VrKwbYb{[suTR2v:5s/)I-OwsR->1PZs<kHaybMb2.y",
        "privateKey":"private.pem",
        "publicKey":"public.pem",
        "account":"ADDog-API",
        "authKey":"fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9",
        "server":"",
        "baseDn":"",
        "domainFQDN":"",
        "domainUsername":"",
        "passwordMinLength":"",
        "printServer":"",
        "adSyncServer":"",
        "loginMsg":""
      }
    }
  }


settings.Settings.server = req.body.inputDC;
var inputDomain = req.body.inputDomain;
var inputOU = req.body.inputOU;
var inputUsername = req.body.inputUsername;
var inputPassword = req.body.inputPassword;

client = ldap.createClient({
    url: 'ldap://' + settings.Settings.server + ':389',
    tlsOptions: options,
    reconnect: true
})

connect(inputUsername + "@" + inputDomain, inputPassword, function(result){

  logError("Saving Settings")

  if(result == "Not Connected") {
    res.redirect('/settings?failed');
  } else {

  keytar.setPassword(settings.Settings.account,inputUsername + "@" + inputDomain,inputPassword);

  settings.Settings.baseDn = inputOU;
  settings.Settings.domainFQDN = inputDomain;
  settings.Settings.domainUsername = inputUsername;
  settings.Settings.passwordMinLength = "";
  settings.Settings.printServer = "";
  settings.Settings.adSyncServer = "";
  settings.Settings.loginMsg = "";

  try {
    writeSettingsFile(settings, function(){
      res.redirect('/');
      executeCommand('net stop "addog" && net start "addog"');
    });
  } catch (err) {
    logError("Error saving settings: " + err)
    res.redirect('/settings?failed');
  }


}
});

});

//Authentication

app.post('/login',function(req, res){

    var username = req.body.username;
    var password = req.body.password;

    if(username == "") { username = "null" }
    if(password == "") { password = "null" }

    try {
      var users = JSON.parse(fs.readFileSync('settings/users.data'));
    } catch (err) {
      fs.writeFileSync('settings/users.data', "{}");
      var users = JSON.parse(fs.readFileSync('settings/users.data'));
    }

    connect(username + "@" + settings.Settings.domainFQDN, password, function(result){

        if(result == "Not Connected") {
          res.redirect('/login?' + username + '&failed');
        }

        if(result == "Missing Settings") {
          res.redirect('/settings');
        }

        if(result == "Connected") {
          if(hasValueDeep(users, username) || settings.Settings.domainUsername.toLowerCase() == username.toLowerCase()) {
            req.session.auth = true;
            req.session.username = username;
            loggedInUser = username;
            if(users[username]) {
              req.session.distinguishedNames = users[username].distinguishedNames;
            } else { req.session.distinguishedNames = [settings.Settings.baseDn]; }
            logError(username + " has logged in")
            res.redirect('/');
          } else {
            res.redirect('/login?' + username + '&failed');
          }
        }

    });

});

function requireLogin (req, res, next) {
  if (!req.session.auth) {
    res.redirect('/login');
  } else {
    next();
  }
};

function requireLogin_noAuth (req, res, next) {
  if (!req.session.auth) {
    res.redirect('/login');
  } else if (settings.Settings.domainUsername.toLowerCase() != req.session.username.toLowerCase()) {
    res.redirect('/');
  } else {
    next();
  }
};

function isAdmin(req){
  if(settings.Settings.domainUsername.toLowerCase() == req.session.username.toLowerCase()) { return true; }
}

function approvedOu(req,ou,ret) {
  try {
  var approvedOus = req.session.distinguishedNames
  ou = ou.split(",")
  ou.shift()
  ou = ou.toString();
  approvedOus.forEach(function(approvedOu){
    if(ou.endsWith(approvedOu)) { ret("Approved"); }
  })
} catch (err) {
  logError(err)
  ret("Not Approved");
}
}

function renderLayout(req,res,page) {

  if(isAdmin(req)) {
    res.render(page, {layout : 'index'});
  } else {
    res.render(page, {layout : 'index_auth'});
  }

}


// Page requests

app.get('/', requireLogin, (req, res) => { renderLayout(req,res,'main') });
app.get('/addnewuser', requireLogin, (req, res) => { if(fs.readFileSync('settings/templates.data') != "{}") { renderLayout(req,res,'addnewuser') } else { renderLayout(req,res,'addtemplate') } });
app.get('/resetpw', requireLogin, (req, res) => { renderLayout(req,res,'resetpw') });
app.get('/removeuser', requireLogin, (req, res) => { renderLayout(req,res,'removeuser') });
app.get('/enableuser', requireLogin, (req, res) => { renderLayout(req,res,'enableuser') });
app.get('/exportbulkusers', requireLogin, (req, res) => { renderLayout(req,res,'exportbulkusers') });
app.get('/disableuser', requireLogin, (req, res) => { renderLayout(req,res,'disableuser') });
app.get('/editsettings', requireLogin_noAuth, (req, res) => { renderLayout(req,res,'editsettings') });
app.get('/edituser', requireLogin, (req, res) => { renderLayout(req,res,'edituser') });
app.get('/activity', requireLogin, (req, res) => { renderLayout(req,res,'main') });
app.get('/resetprintqueue', requireLogin, (req, res) => { renderLayout(req,res,'resetprintqueue') });
app.get('/resetpwbulk', requireLogin, (req, res) => { renderLayout(req,res,'resetpwbulk') });
app.get('/addbulkusers', requireLogin, (req, res) => { if(fs.readFileSync('settings/templates.data') != "{}") { renderLayout(req,res,'addbulkusers') } else { renderLayout(req,res,'addtemplate') } });
app.get('/removebulkusers', requireLogin, (req, res) => { renderLayout(req,res,'removebulkusers') });
app.get('/addtemplate', requireLogin_noAuth, (req, res) => { renderLayout(req,res,'addtemplate') });
app.get('/removetemplate', requireLogin_noAuth, (req, res) => { if(fs.readFileSync('settings/templates.data') != "{}") { renderLayout(req,res,'removetemplate') } else { renderLayout(req,res,'addtemplate') } });
app.get('/login', (req, res) => { if (req.session.auth) { res.render('main', {layout : 'index'}); } else { res.render('login', {layout : 'outdex'}); } });
app.get('/settings', (req, res) => { if(settingsApplied) { res.redirect('/login'); } else { res.render('settings', {layout : 'outdex'}); } });
app.get('/logout', (req, res) => { req.session.auth = false; res.redirect('/'); })
app.get('/installupdate'), (req, res) => { autoUpdater.quitAndInstall(); }

var options = {
  key: key,
  cert: cert
};

var webServer = https.createServer(options, app);

webServer.listen(port, () => { logError("AD Dog has started") })
.on('error', (err) => { logError('Error starting AD Dog: ' + err); });

webServer.on('uncaughtException', function(err) {
  logError('Error running AD Dog: ' + err);
});

// Variables

var dn = '';
var loggedInUser = '';


// Password retrieval

keytar.getPassword(settings.Settings.account,settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN).then(function(result) {
  domainPassword = result;
});


var options = {
    'rejectUnauthorized': false,
}

var client = ldap.createClient({
    url: 'ldap://' + settings.Settings.server + ':389',
    tlsOptions: options,
    reconnect: true
})

client.on('timeout', function (err) {
    logError('LDAP Connection Timeout: ' + err);
    connect(function() {
      logError("LDAP Re-connected");
    });
});

client.on('error', function (err) {
    logError('LDAP connection failed, it will reconnect', err);
});


async function connect(username = settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN, password = domainPassword,callback) {

  try {

  if(settings.Settings.server == "") { callback("Missing Settings"); };

  if(requireLogin) {

    client.starttls(options,[], function(err) {
        var bind = client.bind(username, password, function(err) {
          if(err != null) { logError("Error Binding with AD: " + err); callback("Not Connected"); } else { callback("Connected"); }
        })
    })

  }

} catch (err) {
  logError("Connect Error: " + err)
  callback("Not Connected")
}

}



// Page requests

app.get("/adduser", requireLogin, function(req, res) {

  connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

    if(connection == "Connected") {

    if(!req.query.authKey) {
      res.redirect('/');
    } else {

        if(req.query.authKey === settings.Settings.authKey) {

          if(!req.query.ou) {
              res.send("Missing URL argument 'OU'");
          } else {
            if(!req.query.data) {
              res.send("Missing URL argument 'Data'");
          } else {
            addUser(req.query.ou,req.query.data,function(result){
              if(result == "Success") {
                res.send("Success")
              } else {
                res.send(result)
              }
            });
          }
        }

    } else { res.redirect('/'); }
  }

} else { res.send("Disconnected") }

  });

})

app.get("/deluser", function(req, res) {

  connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

    if(connection == "Connected") {

    if(!req.query.authKey) {
      res.redirect('/');
    } else {

        if(req.query.authKey === settings.Settings.authKey) {

        if(!req.query.username) {
          res.send("Missing URL argument 'Username'");
      } else {
        delUser(req,function(result){
          if(result == "Success") {
            res.send("Success")
          } else {
            res.send(result)
          }
        });
      }

    } else { res.redirect('/'); }
  }

} else { res.send("Disconnected") }

});


})

app.get("/modifyuser", function(req, res) {

  try {

  connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

    if(connection == "Connected") {

        if(!req.query.authKey) {
          res.redirect('/');
        } else {

            if(req.query.authKey === settings.Settings.authKey) {

            if(!req.query.username) {
                res.send("Missing URL argument 'Username'");
            } else {
              if(!req.query.data) {
                res.send("Missing URL argument 'Data'");
            } else {
              modifyUser(req,function(result){
                if(result == "Success") { res.send("Success") } else { res.send(result) }
              });
            }
          }

        } else { res.redirect('/'); }
      }

    } else { res.send("Disconnected") }

    });

  } catch (err) {
    logError(err)
  }

})

app.get("/addusertogroup", function(req, res) {

  connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

  if(connection == "Connected") {

    if(!req.query.authKey) {
      res.redirect('/');
    } else {

        if(req.query.authKey === settings.Settings.authKey) {

          if(!req.query.username) {
              res.send("Missing URL argument 'Username'");
          } else {
            if(!req.query.group) {
              res.send("Missing URL argument 'Group'");
          } else {
            addUserToGroup(req.query.username,req.query.group,function(result){
              if(result == "Success") { res.send("Success") }
            });
          }
        }

    } else { res.redirect('/'); }
  }

  } else { res.send("Disconnected") }

  });

})

app.get("/lookupuser", function(req, res) {

connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

  if(connection == "Connected") {

      if(!req.query.authKey) {
        res.redirect('/');
      } else {

          if(req.query.authKey === settings.Settings.authKey) {

          if(!req.query.username) {
            res.send("Missing URL argument 'Username'");
        } else {
          lookupUser(req.query.username,function(user) {
            if(user == null) {
              res.send("Error looking up username")
            } else {
              res.send(user);
            }
          });
        }

      } else { res.redirect('/'); }
    }

    } else { res.send("Disconnected") }

    })

});

app.get("/allusers", function(req, res) {

  connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

    if(connection == "Connected") {

      if(!req.query.authKey) {
        res.redirect('/');
      } else {

        if(req.query.authKey === settings.Settings.authKey) {

          var ou = req.session.distinguishedNames;
          if(req.query.ou != "null") { ou = [req.query.ou] }
          if(!Array.isArray(ou)) { ou = [ou] }

          getUsersFromOus(ou,function(results){
            res.send(results);
          })

          function getUsersFromOus(ou, callback) {
            var results = [];
            for (const [i, value] of ou.entries()) {

              allUsers(value,function(users) {
                if(users != null) {
                  users.forEach(function(entry) {
                      results.push(entry)
                  });
                  }
                  if (i === ou.length - 1) {
                    callback(results);
                  }
              });

            }
          }

      } else { res.redirect('/'); }
    }

  } else { res.send("Disconnected") }

    })

  });

  app.get("/outree", function(req, res) {

    connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

      if(connection == "Connected") {

        if(!req.query.authKey) {
          res.redirect('/');
        } else {

          if(req.query.authKey === settings.Settings.authKey) {

            var ou = []
            if(req.session.distinguishedNames) { ou = req.session.distinguishedNames; } else { ou = [] }

            getOus(ou,function(results){
              res.send(results);
            })

            function getOus(ou, callback) {
              var results = [];
              for (const [i, value] of ou.entries()) {

                ouTree(value,function(users) {
                  if(users != null) {
                    users.forEach(function(entry) {
                        results.push(entry)
                    });
                  }
                  if (i === ou.length - 1) {
                    callback(results);
                  }
                });

              }
            }

        } else { res.redirect('/'); }
      }

  } else { res.send("Disconnected") }

      })

    });

  app.get("/addusertemplate", function(req, res) {

      connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

        if(connection == "Connected") {

          if(!req.query.authKey) {
            res.redirect('/');
          } else {

            if(req.query.authKey === settings.Settings.authKey) {

              if(!req.query.template) {
                res.send("Missing URL argument 'Template'")
              } else {
              addUserTemplate(req.query.template,function(result) {
                if(result == null) {
                  res.send("Error adding template")
                } else {
                  res.send(result);
                }
              });
            }

          } else { res.redirect('/'); }
        }

        } else { res.send("Disconnected") }

        })

      });

  app.get("/removeusertemplate", function(req, res) {

    connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

      if(connection == "Connected") {

        if(!req.query.authKey) {
          res.redirect('/');
        } else {

          if(req.query.authKey === settings.Settings.authKey) {

            if(!req.query.template) {
              res.send("Missing URL argument 'Template'")
            } else {
            removeUserTemplate(req.query.template,function(result) {
              if(result == null) {
                res.send("Error removing template")
              } else {
                res.send(result);
              }
            });
          }

        } else { res.redirect('/'); }
      }

      } else { res.send("Disconnected") }

      })

    });

  app.get("/getusertemplates", requireLogin, function(req, res) {

    connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

      if(connection == "Connected") {

        if(!req.query.authKey) {
          res.redirect('/');
        } else {

          if(req.query.authKey === settings.Settings.authKey) {
              getUserTemplates(function(result) {
              if(result == "{}") {
                res.send("Error getting templates")
              } else {
                var parsedResult = JSON.parse(result);
                for (const key of Object.keys(parsedResult)) {
                    if(parsedResult[key].authorised.includes(req.session.username) || req.session.username.toLowerCase() == settings.Settings.domainUsername.toLowerCase()) { } else { delete parsedResult[key]; }
                }
                result = JSON.stringify(parsedResult);
                res.send(result);
              }
            });

        } else { res.redirect('/'); }
      }

      } else { res.send("Disconnected") }

      })

    });


    app.get("/readactivitylog", requireLogin, function(req, res) {

      connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

        if(connection == "Connected") {

          if(!req.query.authKey) {
            res.redirect('/');
          } else {

            if(req.query.authKey === settings.Settings.authKey) {
                readActivityLog(function(result) {
                if(result == null) {
                  res.send("Error getting log")
                } else {
                  res.send(result);
                }
              });

          } else { res.redirect('/'); }
        }

        } else { res.send("Disconnected") }

        })

      });


    app.get("/readsettings", requireLogin, function(req, res) {

      connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

        if(connection == "Connected") {

          if(!req.query.authKey) {
            res.redirect('/');
          } else {

            if(req.query.authKey === settings.Settings.authKey) {
                readSettings(function(result) {
                if(result == null) {
                  res.send("Error getting settings")
                } else {
                  res.send(result);
                }
              });

          } else { res.redirect('/'); }
        }

        } else { res.send("Disconnected") }

        })

      });


  app.get("/writesettings", requireLogin, function(req, res) {

    logError("Writing Settings")

    req.query.settings = Buffer.from(req.query.settings, 'base64');
    req.query.settings = req.query.settings.toString('ascii');

    connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

      if(connection == "Connected") {

        if(!req.query.authKey) {
          res.redirect('/');
        } else {

          if(!req.query.settings) {
              res.send("Missing URL argument 'Settings'");
          } else {
          if(req.query.authKey === settings.Settings.authKey) {

              writeSettingsFile(req.query.settings, function(result) {
              if(result == "Success") {
                res.send(result);
              } else {
                res.send("Error writing settings")
              }
            });

          } else { res.redirect('/'); }

        }
      }

      } else { res.send("Disconnected") }

      })

    });

    app.get("/addloginuser", requireLogin, function(req, res) {

      connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

        if(connection == "Connected") {

          if(!req.query.authKey) {
            res.redirect('/');
          } else {

            if(!req.query.username) {
                res.send("Missing URL argument 'Username'");
            } else {
              if(!req.query.distinguishedNames) {
                  res.send("Missing URL argument 'distinguishedNames'");
              } else {
              if(req.query.authKey === settings.Settings.authKey) {
                  addLoginUser(req.query.username, req.query.distinguishedNames, function(result) {
                  if(result == "Success") {
                    res.send(result);
                  } else {
                    res.send("Error adding login user")
                  }
                });

              } else { res.redirect('/'); }
            }
          }
        }

        } else { res.send("Disconnected") }

        })

      });

      app.get("/readloginusers", requireLogin, function(req, res) {

        connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

          if(connection == "Connected") {

            if(!req.query.authKey) {
              res.redirect('/');
            } else {

              if(req.query.authKey === settings.Settings.authKey) {
                  readLoginUsers(function(result) {
                  if(result == null) {
                    res.send("Error getting users")
                  } else {
                    res.send(result);
                  }
                });

            } else { res.redirect('/'); }
          }

          } else { res.send("Disconnected") }

          })

        });

        app.get("/resetprinterqueue", requireLogin, function(req, res) {

          logError("Resetting Print Queue")

          connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

            if(connection == "Connected") {

              if(!req.query.authKey) {
                res.redirect('/');
              } else {

                if(req.query.authKey === settings.Settings.authKey) {

                  var cmd = `$PrintIsolationHost = Get-Process PrintIsolationHost -ErrorAction SilentlyContinue;Stop-Service -Name spooler -Force;$PrintIsolationHost | Stop-Process -Force;Remove-Item -Path "$env:SystemRoot\\System32\\spool\\PRINTERS\\*" -Recurse -Force;Start-Service -Name spooler`;
                    executePowershell(cmd,function(result) {
                    if(result == null) {
                      res.send("Error resetting print queue")
                    } else {
                      res.send("Success");
                    }
                  });

              } else { res.redirect('/'); }
            }

            } else { res.send("Disconnected") }

            })

          });

        app.get("/updateapp", requireLogin, function(req, res) {

          logError("Updating AD Dog")

          connect(settings.Settings.domainUsername + '@' + settings.Settings.domainFQDN,domainPassword,function(connection){

            if(connection == "Connected") {

              if(!req.query.authKey) {
                res.redirect('/');
              } else {

                if(req.query.authKey === settings.Settings.authKey) {

                  var cmd = `git\\bin\\git.exe -c http.sslVerify=false reset --hard 2>&1`;
                    executePowershell(cmd,function(result) {
                    if(result == null) {
                      res.send("Error updating AD Dog")
                    } else {

                      cmd = `git\\bin\\git.exe -c http.sslVerify=false pull https://github.com/Filk47473831/ADDog-v2.git`;
                      executePowershell(cmd,function(result) {

                      res.send(result);

                    });

                    }
                  });

              } else { res.redirect('/'); }
            }

            } else { res.send("Disconnected") }

            })

          });



// Redirect if no match
app.get('*', function(req, res) { res.redirect('/'); });


// API Functions

function executeCommand(cmd) {

  exec(cmd, (error, stdout, stderr) => {
      if (error) {
          logError(`Execute Command Error: ${error.message}`);
          return;
      }
      if (stderr) {
          logError(`Execute Command Error: ${stderr}`);
          return;
      }
      logError(`Execute Command Output: ${stdout}`);
  });

}

function executePowershell(cmd,ret) {

  let ps = new shell({
    executionPolicy: 'Bypass',
    noProfile: true
  });

  ps.addCommand(cmd)
  ps.invoke().then(output => {
    logError("Execute Command Output: " + output);
    ret("Success: " + output);
  }).catch(err => {
    logError("Execute Command Error: " + err);
    ps.dispose();
    ret("Error: " + err);
  });
}


function addUser(ou,data,ret) {

ou = Buffer.from(ou, 'base64');
ou = ou.toString('ascii');
data = Buffer.from(data, 'base64');
data = data.toString('ascii');

data = JSON.parse(data)
dn = "CN=" + data.displayName + "," + ou;

try {
  client.add(dn, data, function(err) {
    if(err != null) { logError("Error adding user: " + err); ret("Error adding user: " + err); } else {

      var cmd = `Start-ADSyncSyncCycle -PolicyType Delta`;
        executePowershell(cmd,function(result) {
          if(result == null) {
            logError("Error Sync'ing with Azure AD")
          } else {
            logError("Sync'd with Azure AD")
          }
        });

      writeActivityLogFile("User Added," + data.name + "," + loggedInUser);
      logError("Successfully added user (DN: " + dn + ")"); ret("Success"); }
  });
} catch(err) {
  logError(err);
  ret(null);
}

}

function delUser(req,ret) {

  var username = req.query.username;

lookupUser(username,function(user) {
  if(user == null) {
    ret("No results for lookup");
  } else {
    dn = user.dn;

    approvedOu(req,dn,function(result){
      if(result == "Approved") {

try {
    client.del(dn, function(err) {
      if(err != null) { logError("Error deleting user: " + err); ret("Error deleting user: " + err); } else {
        writeActivityLogFile("User Deleted," + user.name + "," + loggedInUser);
        logError("Successfully deleted user (DN: " + dn + ")"); ret("Success"); }
    });
  } catch(err) {
    logError(err);
    ret(null);
  }

} else { ret("Error modifying user: Unauthorised"); }

})

  }

})

}

function modifyUser(req,ret) {

  var username = req.query.username
  var data = req.query.data

lookupUser(username,function(user) {
    if(user == null) {
      ret("No results for lookup");
    } else {
      dn = user.dn;

      approvedOu(req,dn,function(result){
        if(result == "Approved") {

          data = Buffer.from(data, 'base64');
          data = data.toString('ascii');
          data = JSON.parse(data)

          var changes = [];

          for (var key in data) {
            addChange(key, data[key])
          }

        function addChange(attr, value) {

          if(attr == 'unicodePwd') { value = encodePassword(value); }

          var change = new ldap.Change({
                  operation: 'replace',
                  modification: {[attr]:value}
           })
          changes.push(change)
        }



  try {
        client.modify(dn, changes, function(err) {
          if(err != null) { logError("Error modifying user: " + err); ret("Error modifying user: " + err); } else {
            writeActivityLogFile("User Modified," + user.name + "," + loggedInUser);
            logError("Successfully modified user (DN: " + dn + ")"); ret("Success"); }
        })
      } catch(err) {
        logError(err);
        ret(null);
      }

    } else { logError("Error modifying user: Unauthorised"); ret("Error modifying user: Unauthorised"); }

      })



  }

})

}

function addUserToGroup(username,groupname,ret) {

lookupUser(username,function(user) {
    if(user == null) {
      ret("No results for lookup")
    } else {
      userDn = user.dn;

      lookupGroup(groupname,function(group) {
          if(group == null) {
            ret("No results for lookup")
          } else {
            groupDn = group.dn;

        var change = new ldap.Change({
          operation: 'add',
          modification: {
          member: [userDn]
          }
        });

try {
      client.modify(groupDn, change, function(err) {
        if(err != null) { logError("Error modifying group: " + err); ret("Error modifying group: " + err); } else {
          writeActivityLogFile("User Modified," + user.name + "," + loggedInUser);
          logError("Successfully modified group (DN: " + groupDn + ")"); ret("Success"); }
      })
    } catch(err) {
        logError(err);
        ret(null);
      }

    } })

  }
})
}


function lookupUser(req,ret) {

  var opts = {
    filter: "(&(objectCategory=organizationalPerson)(objectClass=User)(sAMAccountName=" + req + "))",
    scope: "sub",
    client: "*"
  }

  try {
    client.search(settings.Settings.baseDn, opts, function(err, res) {

    var results = [];

    res.on('searchEntry', function(entry) {
      results.push(entry.object);
      ret(entry.object);
    });
    res.on('error', function(err) {
      logError('Error: ' + err.message);
    });
    res.on('end', function(result) {
      if(results.length == 0) {
        logError('No results for user lookup');
        ret(null);
      }
    })
    })
    } catch(err) {
      logError(err);
      ret(null);
    }

}

function lookupGroup(req,ret) {

  var opts = {
    filter: "(&(objectClass=group)(sAMAccountName=" + req + "))",
    scope: "sub",
    client: "*"
  }

  try {
    client.search(settings.Settings.baseDn, opts, function(err, res) {

    var results = [];

    res.on('searchEntry', function(entry) {
      results.push(entry.object);
      ret(entry.object);
    });
    res.on('error', function(err) {
      logError('Error: ' + err.message);
    });
    res.on('end', function(result) {
      if(results.length == 0) {
        logError('No results for group lookup');
        ret(null);
      }
    })
    })
    } catch(err) {
      logError(err);
      ret(null);
    }

}


function allUsers(searchOu,ret) {

var opts = {
  filter: `(&(objectCategory=organizationalPerson)(objectClass=User))`,
  scope: 'sub',
  paged: true,
  sizeLimit: 200
};

try {
  client.search(searchOu, opts, function(err, res) {

    var results = [];

    res.on('searchEntry', function(entry) {
      results.push(entry.object);
    });
    res.on('error', function(err) {
      logError('Error: ' + err.message);
    });
    res.on('end', function(result) {
      if(results.length == 0) {
        logError('No results for lookup');
      } else {
        ret(results);
      }
    });
  });
  } catch(err) {
    logError(err);
    ret(null);
  }
}


function ouTree(searchOu,ret) {

var opts = {
  filter: `(objectClass=organizationalunit)`,
  scope: 'sub',
  paged: true,
  sizeLimit: 200
};

try {
client.search(searchOu, opts, function(err, res) {

  var results = [];

  res.on('searchEntry', function(entry) {
    results.push(entry.object);
  });
  res.on('page', function(result) {
    // logError('Searching: End of page');
  });
  res.on('error', function(err) {
    logError('Error: ' + err.message);
  });
  res.on('end', function(result) {
    if(results.length == 0) {
      logError('No results for OU lookup');
    } else {
      ret(results);
    }
  });
});
} catch(err) {
  logError(err);
  ret(null);
}
}

function addUserTemplate(template,ret) {

template = Buffer.from(template, 'base64');
template = template.toString('ascii');
template = JSON.parse(template);

var userTemplateName = template.userTemplateName

var data = {};

  try {
    data = JSON.parse(fs.readFileSync('settings/templates.data'));
  } catch (err) {
    logError("Error reading template data: " + err)
  }

data[userTemplateName] = template;

try {
  fs.writeFileSync('settings/templates.data', JSON.stringify(data));
  ret("Success");
} catch (err) {
  logError("Error adding user template: " + err)
  ret("Failed");
}

}

function removeUserTemplate(template,ret) {

var data = {};

try {
  data = JSON.parse(fs.readFileSync('settings/templates.data'));
} catch (err) {
  logError("Error reading template data: " + err)
}

delete data[template];

try {
  fs.writeFileSync('settings/templates.data', JSON.stringify(data));
  ret("Success");
} catch (err) {
  logError("Error removing template: " + err)
  ret(null);
}
}

function getUserTemplates(ret) {

var data = "";
try {
  data = fs.readFileSync('settings/templates.data');
} catch (err) {
  logError("Error reading templates: " + err);
}
ret(data);
}




// Misc Functions

function readActivityLog(ret) {
  var data = fs.readFileSync('activity.log');
  ret(data);
}

function readSettings(ret) {
  var data = fs.readFileSync('settings/settings.data');
  ret(data);
}

function readLoginUsers(ret) {
  var data = fs.readFileSync('settings/users.data');
  ret(data);
}

function writeActivityLogFile(entry) {
  var data = fs.readFileSync('activity.log');

  var date = new Date(Date.now());
  date = date.toLocaleString();
  entry = date + "," + entry;

  if(data != "") {
    data = data + '\r\n' + entry;
  } else {
    data = entry;
  }

  fs.writeFileSync('activity.log', data);

}

function logError(entry) {
  var data = fs.readFileSync('debug.log');

  var date = new Date(Date.now());
  date = date.toLocaleString();
  entry = date + "," + entry;

  if(data != "") {
    data = data + '\r\n' + entry;
  } else {
    data = entry;
  }

  fs.writeFileSync('debug.log', data);

}

function writeSettingsFile(settings, ret) {

  fs.writeFileSync('settings/settings.data', JSON.stringify(settings))
  ret("Success");

}

function addLoginUser(username, distinguishedNames, ret) {
  if(username == "null" && distinguishedNames == "null") {
    fs.writeFileSync('settings/users.data', "{}");
    ret("Success");
  } else {
  var users = fs.readFileSync('settings/users.data');
  users = JSON.parse(users);
  distinguishedNames = JSON.parse(distinguishedNames);
  var key = username;
  users[key] = { 'username': username, 'distinguishedNames': distinguishedNames };
  users = JSON.stringify(users);
  fs.writeFileSync('settings/users.data', users);
  ret("Success");
  }
}

function encodePassword(str) {
  var output = '';
  str = '"' + str + '"';

  for(var i = 0; i < str.length; i++){
    output += String.fromCharCode( str.charCodeAt(i) & 0xFF,(str.charCodeAt(i) >>> 8) & 0xFF);
  }

  return output;
}

function hasValueDeep(json, findValue) {
  const values = Object.values(json);
  let hasValue = values.includes(findValue);
  values.forEach(function(value) {
    if (value !== null) {
      if (typeof value === "object") {
        hasValue = hasValue || hasValueDeep(value, findValue);
      }
    }
  })
  return hasValue;
}
