function() {

    var values = $(this).parent().find('input').attr('value');

    $("#dialog-bloc").trigger("editEnum", [values, $(this)]);

    return false;
}