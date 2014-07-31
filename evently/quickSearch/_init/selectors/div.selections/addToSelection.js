function(e, selectionId, docIds) {
    // sid -> selection id
    // ids -> list of ids
    if (selectionId && docIds.length > 0) {
        var $this = $(this),
            app = $$(this).app,
            utilsLib = app.getlib('utils'),
            db = app.db;
    
        db.openDoc(selectionId, {success: function(sdoc) {
            // remove duplicate
            var idsHash = {};
            for (var i = 0; i < sdoc.ids.length; i++) {
                var id = sdoc.ids[i];
                idsHash[id] = true;
            }
            for (var i = 0; i < docIds.length; i++) {
                var id = docIds[i];
                idsHash[id] = true;
            }
            docIds = [];
            for (var key in idsHash) {
                docIds.push(key);
            }
            sdoc.ids = docIds;
            
            db.saveDoc(sdoc, {success: function() {
                $this.trigger('_init');
                utilsLib.showSuccess('Documents have been added to the selection.')
            }});
        }});
    }
}