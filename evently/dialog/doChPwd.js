function(e, pwd, pwd2, email) {
    var app = $$(this).app,
        utilsLib = app.libs.utils,
        elem = $(this);
    
    if (pwd != pwd2) {
        utilsLib.showError('Passwords do not match.');
    } else if (!pwd || !pwd.length) {
        utilsLib.showError('Empty password.');
    } else if (pwd.length < 4) {
        utilsLib.showError('Password is too short');
    } else {
        var name = app.userCtx.name,
            info = app.info;
        
        $.couch.db(info.authentication_db).openDoc('org.couchdb.user:' + name, {
            success: function(user) {
                user.email = email;
                delete user.password_sha;
                delete user.salt;
                user.password = pwd;

                $.couch.db(info.authentication_db).saveDoc(
                    user, 
                    {
                        success: function() {
                            utilsLib.showSuccess('Password and email for ' + name + ' changed.');
                            elem.trigger('doLogin', [name, pwd]);
                        },
                        error: function(a,b,c) {
                            utilsLib.showError('Error : ' + a + b + c);
                        }
                    });
            }
        });
    }
};