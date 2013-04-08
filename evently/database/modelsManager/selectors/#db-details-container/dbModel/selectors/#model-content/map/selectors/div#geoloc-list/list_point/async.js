function (callback, e, ids, b) {

    var db = $$(this).app.db;
    db.view("datamanager/label", {
        keys:ids.map(function (e) { return [0, e]; }),
        reduce:false,
        limit:100,
        success : function (data) {
            callback(data.rows.map(function (e) {
                return {_id:e.id,label:e.value.label};
            }));
        }
    });
}