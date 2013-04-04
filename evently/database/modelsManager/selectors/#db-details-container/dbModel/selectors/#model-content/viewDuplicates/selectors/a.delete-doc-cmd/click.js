function () {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docLib = app.getlib('doc'),
        id = $(this).data('id');

    var answer = confirm ('Delete doc and subdocs ?');
    if(! answer) {
        return false;
    }

    var onError = utilsLib.showError,
        onSuccess = function () {
            $.pathbinder.begin();
            utilsLib.showSuccess('Doc and sons deleted');
        };

    docLib.delete_with_sons(app.db, [id], onSuccess, onError);

    return false;
}