function(e) {
    var app = $$(this).app,
        ids = e.data.args[1].ids,
        onSuccess = e.data.args[1].success || function() {},
        onError = e.data.args[1].error || function() {},
        docLib = app.getlib('doc'),
        utilsLib = app.getlib('utils'),
        deleteSynonyms = $('#confirm-delete-synonyms').attr('checked') == 'checked';

    docLib.delete_with_sons(app.db, ids, function(nb) {
        utilsLib.showSuccess(nb + ' document' + (nb > 1 ? 's have' : ' has') + ' been deleted');
        onSuccess();
    }, function(err) {
        utilsLib.showError('Error during deletion');
        onError();
    }, deleteSynonyms);

    $('#confirm-delete-modal').modal('hide');

    return false;
}