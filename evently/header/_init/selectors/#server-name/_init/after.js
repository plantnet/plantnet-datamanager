function() {
    var app = $$(this).app;
    $('#db-info-container').attr('class', 'server-type alert '+app.server.typeClass);
}