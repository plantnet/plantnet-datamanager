function(callback, e, id, trigger) {

    var app = $$(this).app;
    var time = JSON.stringify(new Date().getTime());
    app.data.trigger = trigger;

    app.db.openDoc(id, {
        success: function(doc) {
            // get active syn
            if(doc.$synonym) {
                id = doc.$synonym;
            }

            app.db.view("datamanager/synonym", {
                cache : time,
                key : id,
                reduce : false,
                include_docs : true,
                success : function(syndata) {
                    callback(id, doc, syndata.rows);
                }
            });
        }
    });
}