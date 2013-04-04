function () {
    var app = $$(this).app;
    var utils = $$(this).app.libs.utils;

    var userid = $(this).attr("href").slice(1);
    var username = userid.substr(userid.lastIndexOf(':') + 1);
    var $this = $(this);
    
    var onSuccess = function(msg) {
        utils.show_msg('User "' + username + '" deleted.');
        $this.closest("tr").remove();
        },
        onError = function(err) {
            utils.show_err(err);
        };

    if (confirm('Delete user "' + username + '" ?')) {
	    $.couch.userDb(
	        function (userDb) {
	            userDb.openDoc(userid, {
	                               success : function (udoc) {
	                                   userDb.removeDoc(udoc, {
	                                                        success : onSuccess,
	                                                        error : onError
	                                                    });
	                               },
	                               error : onError
	                           });
	        });
    }

    return false;


}