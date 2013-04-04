function (e, changes) {
    //var ids = changes.map(function (e) { return e.id; });
    $.log("tree update");
    var app = $$(this).app,
    treeViewLib = app.getlib('treeview'),
    treeView = $('ul#root'),
    ts = app.data.tree;

    var onError = utilsLib.showError;
    var onSuccess = function () {
        treeView.trigger('_init');
    };

    treeViewLib.apply_changes(app.db, ts, changes, onSuccess, onError);

    return false;

}