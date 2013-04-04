function(e) {
    var data = $$(this).app.data;
    data.action_button = 'new';
    $(this).closest('form').submit();
}