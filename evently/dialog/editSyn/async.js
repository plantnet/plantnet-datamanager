function(callback, e, id, trigger) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        time = JSON.stringify(new Date().getTime()),
        multiDocs = [],
        multiSynData = [],
        tasks;

    app.data.trigger = trigger;

    // merges information from multiple docs and their respective synonymy information
    function mergeInfo() {
        tasks--;
        if (tasks == 0) {
            var sd,
                validNameLabels = {},
                error=false;
            multiDocs.map(function(e) {
                validNameLabels[e.id] = e.doc.$label;
            });
            for (var i=0, l=multiSynData.length; i<l && (! error); i++) {
                sd = multiSynData[i];
                if (sd.key != sd.id) { // id is a synonym of key
                    utilsLib.showWarning('"' + validNameLabels[sd.key] + '" already has synonyms. Edit it separately before.');
                    error = true;
                }
            }
            if (error) {
                utilsLib.hideBusyMsg('viewSyn');
            } else {
                callback(null, null, multiDocs);
            }
        }
    }

    if (utilsLib.is_array(id)) { // set multiple synonyms at once
        var ids = id;
        tasks = 2;
        app.db.allDocs({
            keys: ids,
            include_docs: true,
            success: function(data) {
                multiDocs = data.rows;
                mergeInfo();
            },
            error: function() {
                utilsLib.showError('Could not open selected documents');
            }
        });
        // are the given ids defined as valid names for any other doc(s)?
        // cannot use "reduce=true" because "keys=" implies "group=true" and
        // per-doc synonyms count is lost
        app.db.view("datamanager/synonym", {
            cache : time,
            keys : ids,
            reduce: false,
            success : function(syndata) {
                multiSynData = syndata.rows;
                mergeInfo();
            },
            error: function() {
                utilsLib.showError('Could not get synonyms for selected documents');
            }
        });
    } else {
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
}