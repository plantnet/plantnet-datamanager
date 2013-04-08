function(e) {

    var val = $(this).val(),
        modt = $("select#modt"),
        modt_firstopt = $("select#modt option").first().val();

    if (val) {
        modt.val('');
    } else {
        modt.val(modt_firstopt);
    }
}