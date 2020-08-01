class API {


  lookupUser(username,callback) {

    var command = 'lookupuser';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&username=" + username,
        success: function(result){ callback(result); }
    })

  }

  modifyUser(username,data,callback) {

    var command = 'modifyuser';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';
    data = btoa(data);

    $.ajax({
        url: command + "?authKey=" + authKey + "&username=" + username + "&data=" + data,
        success: function(result){ callback(result); }
    })

  }

  addUser(ou,data,callback) {

    var command = 'adduser';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';
    ou = btoa(ou);

    $.ajax({
        url: command + "?authKey=" + authKey + "&ou=" + ou + "&data=" + data,
        success: function(result){ callback(result); }
    })

  }

  addUserToGroup(username,group,callback) {

    var command = 'addusertogroup';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&username=" + username + "&group=" + group,
        success: function(result){ callback(result); }
    })

  }

  delUser(username,callback) {

    var command = 'deluser';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&username=" + username,
        success: function(result){ callback(result); }
    })

  }

  allUsers(ou,callback) {

    var command = 'allusers';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&ou=" + ou,
        success: function(result){ callback(result); }
    })

  }

  ouTree(callback) {

    var command = 'outree';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  addUserTemplate(template,callback) {

    var command = 'addusertemplate';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&template=" + template,
        success: function(result){ callback(result); }
    })

  }

  removeUserTemplate(template,callback) {

    var command = 'removeusertemplate';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&template=" + template,
        success: function(result){ callback(result); }
    })

  }

  getUserTemplates(callback) {

    var command = 'getusertemplates';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  readActivityLog(callback) {

    var command = 'readactivitylog';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  resetPrintQueue(callback) {

    var command = 'resetprinterqueue';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  updateApp(callback) {

    var command = 'updateapp';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  readSettings(callback) {

    var command = 'readsettings';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

  writeSettings(settings,callback) {

    var command = 'writesettings';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';
    settings = btoa(settings);

    $.ajax({
        url: command + "?authKey=" + authKey + "&settings=" + settings,
        success: function(result){ callback(result); }
    })

  }

  addLoginUser(username,distinguishedNames,callback) {

    var command = 'addloginuser';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey + "&username=" + username + "&distinguishedNames=" + distinguishedNames,
        success: function(result){ callback(result); }
    })

  }

  readLoginUsers(callback) {

    var command = 'readloginusers';
    var authKey = 'fbk9fkq7ObeQy3TQw0mpqqGr2KhUt7RvbvAgTPnbrY3tcSbZFtt5zWKTJRBos6yhzdxqZ2YfyqYvY8MLyzUP5Ty09ITto36Urbhdg1kIPYn1nAuRpxwATIpQl32yqlJJtlJyDhxr6Srk5GezrtNMYicw1xy3mkYVd0GDFLqM7zLv16MFFjms6QY3PS8k24nIUowb1XR9';

    $.ajax({
        url: command + "?authKey=" + authKey,
        success: function(result){ callback(result); }
    })

  }

}
