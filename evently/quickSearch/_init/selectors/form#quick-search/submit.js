function(e) {
    e.preventDefault();
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        req = $('input[name="q"]', this).val(),
        label = encodeURIComponent('"' + req + '"'),
        trimmed = req.replace(/ /g, ''),
        q;

    //quick search query to save
    var query = {
        user: app.userCtx.name,
        req: req
    };

    if (trimmed == '') {
        utilsLib.showWarning('Type something in the search box!');
        return false;
    }
    if (trimmed[0] == '*') {
        utilsLib.showError("You can't start a query with *");
        return false;
    }

    var selectStructure = $('select#quicksearch-structure-selector', this),
        selectModule = $('select#quicksearch-module-selector', this),
        selectField = $('select#quicksearch-field-selector', this),
        selectView = $('select#quicksearch-view-selector', this),
        structure = selectStructure.val(),
        module = selectModule.val(),
        field = selectField.val(),
        fieldType = selectField.find('option:selected').data('type'),
        view = selectView.val(),
        pathToGo = null;

    //quick search query data
    var structure_lbl = structure ? $('select#quicksearch-structure-selector option:selected', this).html() : '',
        module_lbl = module ? $('select#quicksearch-module-selector option:selected', this).html() : '',
        field_lbl = field ? $('select#quicksearch-field-selector option:selected', this).html() : '',
        view_lbl = view ? $('select#quicksearch-view-selector option:selected', this).html() : '';
    query.structure = structure;
    query.module = module;
    query.field = field;
    query.view = view;

    // @TODO move to libQuery
    function getTypeHint(t) {
        switch(t) {
            case 'integer':
            case 'float':
                return '<float>';
                break;
            case 'date':
                return '<date>';
                break;
            default:
                return '';
        }
    }

    function transformReq(req, type) {
        if (type) {
            switch(type) {
                case 'time':
                    if (req.match(/^[0-9]{1,2}:[0-9]{1,2}(:[0-9]{1,2})?$/)) {
                        return req.replace(/:/g, '_');
                    } else {
                        return false;
                    }
                case 'boolean':
                    return (req == 'true' || req == 'false') ? req : false;
                case 'integer':
                case 'float':
                    var float = parseFloat(req);
                    if (isNaN(float)) {
                        return false;
                    } else {
                        return float;
                    }
                case 'date':
                    // Lucene requires complete date or *
                    // @TODO - to make partial request work (with '*'), type hint must be removed!
                    // See http://amap-dev.cirad.fr/projects/p2pnote/wiki/Lucene_operators_by_type
                    //if (req.match(/^[0-9]{1,4}((-[0-9]{1,2}(-[0-9]{1,2}|\*))|\*)$/)) {
                    if (req.match(/^[0-9]{1,4}-[0-9]{1,2}-[0-9]{1,2}$/)) {
                        return req;
                    } else {
                        return false;
                    }
                default:
                    return req;
            }
        } else { // quicksearch with no field selected
            return req.replace(/-/g, '_');
        }
    }

    // field search and type hint
    if (field) {
        // explicite replacement of special chars
        req = transformReq(req, fieldType);
        if (req === false) {
            utilsLib.showWarning('Incorrect format for type "' + fieldType + '"');
            return false;
        }
        q = field + getTypeHint(fieldType) + ':' + encodeURIComponent(req);
    } else {
        // explicite replacement of special chars
        req = transformReq(req);
        q = encodeURIComponent(req);
    }

    if(structure) {
        structure = structure.slice(8);
        q += ' AND _mm:' + encodeURIComponent(structure.replace(/\-/g, ''));
        label += ' in ' + $('option:selected', selectStructure).text();
        if(module) {
            var clause,
                pathbinderModule;
            if (module[0] == '.') {
                clause = ' AND _modi:' + module;
                pathbinderModule = module;
            } else {
                clause = ' AND _modt:' + module;
                pathbinderModule = '*' + module;
            }
            q += clause;
            if (view) {
                pathToGo = '/viewtable/' + view + '/' + pathbinderModule + '/_id/0/0/lucene:' + q + '/0/0/1';
            } else {
                pathToGo = '/viewtable/' + structure + '/' + pathbinderModule + '/_id/0/0/lucene:' + q + '/0/0/1';
            }
        } else {
            pathToGo = '/viewlist/lucene/' + q + '/0/' + label + '/0';
        }
    } else {
        pathToGo = '/viewlist/lucene/' + q + '/0/' + label + '/0';
    }

    $.pathbinder.go(pathToGo);

    //quick search query: to string
    query.tostring = JSON.stringify(query).replace(/ /g, '');
    //quick search query additional data
    query.structure_lbl = structure_lbl;
    query.module_lbl = module_lbl;
    query.field_lbl = field_lbl;
    query.view_lbl = view_lbl;
    query.created_at = new Date().toJSON();

    var qs_doc_id = '_local/quick_search';
    app.db.openDoc(qs_doc_id, {
        success: function(doc) {
            save_quick_search(doc);
        },
        error: function(err) {
            if (err==404) {
                save_new_quick_search();
            }
        }
    });

    function save_new_quick_search() {
        var new_quick_search = {
            _id: qs_doc_id,
            queries: []
        };
        new_quick_search.queries.push(query);
        app.db.saveDoc(new_quick_search, {
            success: function(newDoc) {
                utilsLib.showSuccess('Quick Search query saved.');
            },
            error: function() {
                utilsLib.showError('Error.');
            }
        });
    }

    function save_quick_search(doc) {
        var exists = false;
        var queries = doc.queries;
        for (var i = 0; i < queries.length; i++) {
            q = queries[i];
            if (query.tostring == q.tostring) {
                exists = true;
            }
        }
        if (!exists) {
            doc.queries.push(query);
            app.db.saveDoc(doc, {
                success: function(newDoc) {
                    utilsLib.showSuccess('Quick Search query saved.');
                },
                error: function() {
                    utilsLib.showError('Error.');
                }
            });
        } else {
            // utilsLib.showWarning('Quick Search query already exists.');
        }
    }

    return false;
}