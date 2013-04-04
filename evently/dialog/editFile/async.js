function (callback, e, id, trigger) {

    var $this = $(this);
    var app = $$(this).app;
    app.data.trigger = trigger; 

    app.db.openDoc(id, {
        success : function (doc) {
            if(doc._conflicts) {
                $this.trigger("viewRevs", {id : id});
                return;
            } 
            callback(doc);
        }
    });
}