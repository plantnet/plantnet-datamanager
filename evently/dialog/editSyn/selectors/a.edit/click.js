function() {
    var id = $(this).attr('href').slice(1),
        trigger = $$(this).app.data.trigger;

    $('#edit-syn-modal').modal('hide');
    $('#dialog-bloc').trigger('editDoc', [id, null, trigger]);
    return false;
}