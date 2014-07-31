function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docLib = app.getlib('doc'),
        vnId = $('#syns-of-id', this).val(),
        ids = [];

    // push all future synonyms ids
    $('#synonyms-list-table tbody tr').each(function() {
        ids.push($(this).find('td:first').data('id'));
    });

    if(! vnId) {
        utilsLib.showWarning('You must select a valid name');
        return false;
    }

    function onSuccess() {
        $('#edit-syn-modal').modal('hide');
        $("#dialog-bloc").trigger('editSyn', [vnId, app.data.trigger]);
        utilsLib.showSuccess('Synonymy defined');
    }

    function onError (e,a,b,c) {
        $.log(e,a,b,c);
        utilsLib.showError(e + a + b + c); // beuark
    }

    app.db.openDoc(vnId, {
       success : function(validName) {
           if(validName.$synonym) {
               vnId = validName.$synonym; // transitivity
           }
           docLib.set_active_synonym(app.db, vnId, ids, onSuccess, onError);
       },
       error: onError
   });

    return false;
}