function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmIds = [],
        dbName = app.db.name;

    $(this).parent().find('input[name="mms"]').each(function() {
        if ($(this).attr('checked')) {
            mmIds.push($(this).data('mm-id'));
        }
    });

    var fkMod = ($('input[name="fk-mod"]').attr('checked') == 'checked'),
        fkRef = ($('input[name="fk-ref"]').attr('checked') == 'checked'),
        fieldProps = ($('input[name="field-props"]').attr('checked') == 'checked'),
        target = $('select[name="target"]').val();

    if (! mmIds.length) {
        utilsLib.showError('You must check at least one structure');
    } else {
        var url = '_list/db2sql/export'
            + '?fn=' + dbName + '.sql'
            + '&include_docs=true'
            + '&fkmod=' + fkMod
            + '&fkref=' + fkRef
            + '&fieldprops=' + fieldProps
            + '&target=' + target
            + '&mmids=' + encodeURIComponent(mmIds);
        $.log('Url sql export : ' + url)
        window.location.href = url;
    }

    return false;
}