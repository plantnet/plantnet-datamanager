function (callback, e, ids, b) {

    var db = $$(this).app.db;

    ids = ids.unique();
    ids = ids.map(function (e) {
        return [0, e];
    });

    db.view("datamanager/label", {
        keys: ids,
        reduce:false,
        limit:100,
        success : function (data) {
            callback(data.rows.map(function (e) {
                return {
                    _id: e.id,
                    label: e.value.label
                };
            }));
        }
    });
}