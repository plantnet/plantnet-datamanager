function(e, name, pass, email) {
    var elem = $(this),
        app = $$(this).app,
        utilsLib = app.libs.utils;

    if (!name || !name.length) {
        utilsLib.showError('Empty name.');
        $.log('Empty name.');
    } else if (pass.length < 4) {
        utilsLib.showError('Password is too short');
        $.log('Password is too short');
    } else {
        $.couch.signup(
            {name: name, email: email}, 
            pass, 
            {
                success: function() {
                    utilsLib.showSuccess('Account created.');
                    elem.trigger('doLogin', [name, pass]);
                }
            }
        );
    }
};