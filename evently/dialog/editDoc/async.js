function(callback, e, id, new_doc, trigger) {
    /*
     * new_doc is used to create a new doc. It contains :
     * - modi
     * - mm_id
     * - parent
     * - parent_modi
     */
    var $this = $(this),
        app = $$(this).app,
        db = app.db,
        utilsLib = app.getlib('utils'),
        needGoogleMapLib = false,
        loadGoogleMapLibOk = (typeof google === 'object' && typeof google.maps === 'object') ? true : false,
        loadDocOk = false,
        loadSynLabelOk = false,
        callBackInfos = {},
        parent_id,
        parent_mi,
        synLabel = null;

    app.data.trigger = trigger;
    //$.log('edit', id, 'newdoc', new_doc); // keep it please // c'est bien parce que c'est toi! // ok c'est sympa :)

    // new doc, create it
    if (new_doc) {
        loadSynLabelOk = true; // to unlock final callback
        parent_id = new_doc.parent;
        parent_mi = new_doc.parent_modi;
        loadData(new_doc.mm_id, parent_id, function(mm, parent_id, parent_label, parent_modi) {
            var modi = new_doc.modi,
                //modt = mm.structure[modi][0],
                doc = {
                    $mm: mm._id,
                    $modi: modi,
                    $modt: modi ? mm.structure[modi][0] : null
                };

            getPresets(doc, mm, parent_id, parent_label, parent_mi);
        });
    } else {
        db.openDoc(id, {
            conflicts: true,
            success: function(doc) {
                if (doc._conflicts) {
                    $.pathbinder.go('/viewrevs/' + id + '/conflicts');
                    return;
                }
                parent_id = utilsLib.get_parent(doc);
                loadSynLabel(doc);
                loadData(doc.$mm, parent_id, function(mm, parent_id, parent_label, parent_modi) {
                    getPresets(doc, mm, parent_id, parent_label, parent_modi);
                });
            },
            error: function(err) {
                utilsLib.showError('Cannot find doc');
            }
        });
    }

    function loadData(mm_id, parent_id, onSuccess) {

        db.openDoc(mm_id, {
            success: function(mm) {
                // load parent_id label
                db.view('datamanager/label', {
                    key: [0, parent_id],
                    reduce: false,
                    success: function(labels) {
                        var parent_label = '',
                            parent_modi = '';
                        if (labels.rows.length) {
                            parent_label = labels.rows[0].value.label;
                            parent_modi = labels.rows[0].value.modi;
                        }
                        onSuccess(mm, parent_id, parent_label, parent_modi);
                    }
                });
            },
            error: function() {
                utilsLib.showError('Could not find structure - orphan document?');
            }
        });
    }

    // gets presets for this modt, from the dedicated local doc
    function getPresets(doc, mm, parent_id, parent_label, parent_modi) {
        var tplMm = doc.$mm,
            modt = doc.$modt,
            id = '_local/' + tplMm.replace('_design/', '') + '##' + modt;

        callBackInfos = {
            doc: doc,
            mm: mm,
            presets: {},
            parentId: parent_id,
            parentLabel: parent_label,
            parentModi: parent_modi
        };

        if (needLoadJsLib()) {
            if (needGoogleMapLib) {
                loadGoogleMapLib();
            }
        }

        app.db.openDoc(id, {
            success: function(tplDoc) {
                callBackInfos.presets = tplDoc.presets;
                loadDocOk = true;
                next();
            },
            error: function(msg) {
                //$.log('Error while reading presets');
                loadDocOk = true;
                next();
            }
        });
    }
    
    function needLoadJsLib() {
        var module = callBackInfos.mm.modules[callBackInfos.doc.$modt],
            needLoadJsLib = false;
        
        for (var i = 0; i < module.fields.length; i++) {
            var field = module.fields[i];
            if (field.type == 'geoloc') {
                if (loadGoogleMapLibOk == false) {
                    needGoogleMapLib = true;
                    needLoadJsLib = true;
                }
            }
        }
        
        return needLoadJsLib;
    }

    function loadGoogleMapLib() {

        var r = $.getScript('http://www.google.com/jsapi', function() {
            
            // Step 2: Once the core is loaded, use the google loader to bring in the maps module.
            if(google.maps) {
                loadGoogleMapLibOk = true;
                next();
            } else {
                google.load('maps', '3', {
                    callback: function() {
                        loadGoogleMapLibOk = true;
                        next();
                    },
                    other_params: 'sensor=false&language=en'
                });
            }
        });

    }

    // loads label of doc's "valid name", if doc is a synonym
    function loadSynLabel(doc) {
        if (doc.$synonym) {
            db.view('datamanager/label', {
                key: [0, doc.$synonym],
                reduce: false,
                success: function(data) {
                    //$.log('label trouvé:',data); 
                    synLabel = data.rows[0].value.label;
                    //$.log('label trouvé', callBackInfos.synLabel);
                    loadSynLabelOk = true;
                    next();
                },
                error: function(err) {
                    $.log('error while loading valid name label', err);
                    loadSynLabelOk = true;
                    next();
                }
            });
        } else {
            loadSynLabelOk = true;
            next();
        }
    }

    function next() {

        if (loadDocOk && loadSynLabelOk
            && (needGoogleMapLib === false || (needGoogleMapLib && loadGoogleMapLibOk))) {

            callback(callBackInfos.doc, callBackInfos.mm, callBackInfos.presets, 
                        callBackInfos.parentId, callBackInfos.parentLabel, callBackInfos.parentModi, synLabel);
        }
    }
}
