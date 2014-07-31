function () {
    var app = $$(this).app,
        utilsLib = $$(this).app.libs.utils,
        userid = $(this).attr("href").slice(1),
        username = userid.substr(userid.lastIndexOf(':') + 1),
        $this = $(this);
    
    var onSuccess = function(msg) {
        utilsLib.showSuccess('User "' + username + '" deleted.');
        $this.closest("tr").remove();
        },
        onError = function(err) {
            utilsLib.showError(err);
        };

    if (confirm('Delete user "' + username + '" ?')) {
	    $.couch.userDb(function (userDb) {
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