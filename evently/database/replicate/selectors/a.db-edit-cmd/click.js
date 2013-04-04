function() {
    var utilsLib = $$(this).app.getlib('utils'),
        trigger = new utilsLib.Trigger($('select.ex-url'), '_init', [], false);

    $('#dialog-bloc').trigger('editDbs', [trigger]);
    return false;
}