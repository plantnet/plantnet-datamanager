function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        deleteSynonyms = false;

    if ($('#confirm-delete-for-mod-synonyms').length > 0) {
        deleteSynonyms = $('#confirm-delete-for-mod-synonyms').attr('checked') == 'checked';
    }

    var mm_id = $(this).data('mm'),
        mod = $(this).data('mod');
    if (mod[0] == '*') {
        mod = mod.substring(1);
    }

    var onSuccess = function (nb) {
        $.pathbinder.go($.pathbinder.currentPath().slice(1));
        utilsLib.showSuccess(nb + ' doc' + (nb > 1 ? 's' : '') + ' removed');
    }
    var onError = function (message) {
        utilsLib.showError(message);
    }

    mmLib.delete_mod_docs(app.db, mm_id, mod, onSuccess, onError, deleteSynonyms);

    $('#confirm-delete-for-mod-modal').modal('hide');

    return false;
}