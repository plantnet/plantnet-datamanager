function (callback) {
    var db = $$(this).app.db,
        id = '$wiki'; 

    function saveWiki(data) {
        var d = data || {};
        d._id = id;
        delete d._rev;
        
        db.saveDoc(d, {
            success: function(newdoc) {
                d._rev = newdoc.rev;
                callback(d);
            }
        });
    }

    db.openDoc(id, { 
        success: function(data) {
            callback(data);
        },
        error: function(err) {
            db.openDoc('_local/wiki', {
                success: function(data) {
                    saveWiki(data);
                },
                error: function() {
                    saveWiki();
                }
            }); 
        }
    });
}