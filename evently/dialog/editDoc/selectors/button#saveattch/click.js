function (e) {
    var d = $$(this).app.data;
    d.action_button = "attch";
    $(this).closest('form').submit();
}