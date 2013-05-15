function () {
    var app = $$(this).app,
        utilsLib = appgetlib('utils'),
        userDocs = app.data.user_docs;

    var users = {};
    $('table tbody tr', this).each(function(i) {
        var user_id = $(this).attr('data-user'),
            roles = [];                        
                                
        $('input:checked', this).each(
            function () {
                roles.push($(this).val());
            });    
        users[user_id] = roles;
    });
    
    var onSuccess = function(msg) {
            $.pathbinder.go('/dbs');
            utilsLib.showSuccess('User roles updated.');
        },
        onError = function(err) {
            $.pathbinder.go('/dbs');
            utilsLib.showError(err);
        };
    
    var secLib = app.getlib('security');
    secLib.setUsersRolesBySysAdmin(users, userDocs, onSuccess, onError);
    return false;
}