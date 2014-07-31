function(callback) {
    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        currentStructureId = (app.infos.model.id) ? app.infos.model.id : null;

    if (currentStructureId) {
        mmLib.get_docs_count(app, currentStructureId, function(nbDocs) {
            callback(app, nbDocs);
        });
    } else {
        callback(app, 0);
    }
}