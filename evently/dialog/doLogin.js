function(e, name, pass) {
    var elem = $(this),
        app = $$(this).app,
        utilsLib = app.libs.utils;
    
    $.couch.login({
        name: name,
        password: pass,
        success: function(r) {
            app.userCtx = {
                name: name
            };
            $('#account-menu').trigger('_init');
            $.pathbinder.begin();
            utilsLib.showSuccess('Login successful');
        },
        error : function() {
            utilsLib.showError('Wrong login or password');
        }
    });
};