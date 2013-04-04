function(e) {
    var name = $('input[name="name"]', this).val(),
        pass = $('input[name="password"]', this).val();
    $('#dialog-bloc').trigger('doLogin', [name, pass]);
    return false;
}