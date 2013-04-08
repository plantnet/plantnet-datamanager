function() {
    var app = $$(this).app,
        url = '/_dm/' + app.db.name + '/dump?filename=' + app.db.name + '.json';

    window.location.href = url;

    return false;
}