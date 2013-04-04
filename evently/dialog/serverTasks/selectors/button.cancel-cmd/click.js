function(e) {
    var repTask = e.data.args[2];
    repTask.cancel(function(e) {
            $.log('Task cancelled');
        }, function(e) {
            $.log('Error : Task not cancelled');
        });
}