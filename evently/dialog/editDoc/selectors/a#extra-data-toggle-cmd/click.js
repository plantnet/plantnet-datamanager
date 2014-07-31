function () {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        extraFields = $(".extra-field");

    if (extraFields.length) {
        extraFields.show("fast");
    } else {
        utilsLib.showWarning('This doc has no extra fields');
    }

    return false;
}