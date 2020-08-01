    (function($) {
    "use strict";

    var Anchors = document.getElementsByTagName("a");

    for(var i = 0; i < Anchors.length ; i++) {
        Anchors[i].addEventListener("click",
            function (event) {
              window.scrollTo(0,0);
              document.body.classList.remove("sb-sidenav-toggled");
              document.getElementById("layoutSidenav_content").innerHTML = '<div class="mt-5 d-flex justify-content-center"><i style="font-size:1.2rem" class="fas fa-circle-notch fa-spin"></i></div>';
            },
            false);
    }

    var path = window.location.href;
        $("#layoutSidenav_nav .sb-sidenav a.nav-link").each(function() {
            if (this.href === path) {
                $(this).addClass("active");
                if(this.href.endsWith('resetpw') || this.href.endsWith('addnewuser') || this.href.endsWith('edituser') || this.href.endsWith('removeuser') || this.href.endsWith('enableuser') || this.href.endsWith('disableuser')) {
                  document.getElementById("usersNavItem").classList.remove("collapsed");
                  document.getElementById("collapseLayouts").classList.add("show");
                  document.getElementById("individualUserNavItem").classList.remove("collapsed");
                  document.getElementById("individualUserNavItems").classList.add("show");
                }
                if(this.href.endsWith('resetpwbulk') || this.href.endsWith('exportbulkusers') || this.href.endsWith('addbulkusers') || this.href.endsWith('removebulkusers')) {
                  document.getElementById("usersNavItem").classList.remove("collapsed");
                  document.getElementById("collapseLayouts").classList.add("show");
                  document.getElementById("bulkManageNavItem").classList.remove("collapsed");
                  document.getElementById("bulkManageNavItems").classList.add("show");
                }
                if(this.href.endsWith('addtemplate') || this.href.endsWith('removetemplate')) {
                  document.getElementById("usersNavItem").classList.remove("collapsed");
                  document.getElementById("collapseLayouts").classList.add("show");
                  document.getElementById("templatesNavItem").classList.remove("collapsed");
                  document.getElementById("templatesNavItems").classList.add("show");
                }
                if(this.href.endsWith('resetprintqueue')) {
                  document.getElementById("printingNavItem").classList.remove("collapsed");
                  document.getElementById("collapsePages").classList.add("show");
                }
            }
        });

    $("#sidebarToggle").on("click", function(e) {
        e.preventDefault();
        $("body").toggleClass("sb-sidenav-toggled");
    });

    $("#layoutSidenav_content").click(function (event) {
    if($("body").hasClass("sb-sidenav-toggled")) {
      $("body").toggleClass("sb-sidenav-toggled");
    }
});
})(jQuery);
