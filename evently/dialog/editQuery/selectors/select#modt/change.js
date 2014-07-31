function(e) {

    var val = $(this).val(),
        modi = $("select#modi"),
        modi_opts = $("select#modi option"),
        modi_firstopt = modi_opts[1].value;

    if (val) {
        modi.val('');
    } else {
        modi.val(modi_firstopt);
    }
}