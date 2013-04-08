function() {
    var elem = $(this);
    if ($$(this).app.userCtx.name) {
        elem.trigger('loggedIn');
    } else if ($$(this).app.userCtx.isSuperAdmin) {
        elem.trigger('adminParty');
    } else {
        elem.trigger('loggedOut');
    }
};