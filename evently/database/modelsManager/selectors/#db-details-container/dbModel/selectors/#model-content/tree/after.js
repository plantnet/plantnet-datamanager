function(e, p, q) {
    var app = $$(this).app;

    app.libs.utils.hideBusyMsg('viewTree');
    $('[data-spy="affix"]').affix();

    // reset last clicked checkbox
    app.lastClickedCheckbox = -1;
    app.lastClickedCheckboxState = false;
    
    // define global range selection function
    selectRangeOfCheckboxes = function(element, e) {
        var valCk = ($(element).attr('checked') == 'checked'),
            pos = $(element).index('ul.treenode input.ck'),
            prevPos = app.lastClickedCheckbox,
            prevState = app.lastClickedCheckboxState;
    
        if (e.shiftKey && (prevPos >= 0)) {
            if (pos < prevPos) {
                var tmp = prevPos;
                prevPos = pos;
                pos = tmp;
            }
            $('ul.treenode input.ck').each(function() {
                var idx = $(this).index('ul.treenode input.ck');
                if (idx <= pos && idx >= prevPos) {
                    $(this).attr('checked', prevState);
                }
            });
        }

        app.lastClickedCheckbox = pos;
        app.lastClickedCheckboxState = valCk;
    }

    if (!q) {
        return;
    }

    // run query
    $("#tree-search input").val(q);

    var app = $$(this).app,
        queryLib = app.getlib('query'),
        utilsLib = app.getlib('utils'),
        treeLib = app.getlib('treeview'),
        filterValue = q,
        tree_struct = app.data.tree;

    if (filterValue != '') {
        utilsLib.showBusyMsg('Filtering the tree view...', 'viewTree');
        queryLib.getIds(app.db, filterValue, updateTree, searchError, 100, tree_struct.mm._id);
    }

    function onError(e) {
        utilsLib.hideBusyMsg('viewTree');
        utilsLib.showError(e);
    }

    function onSuccess() {
        utilsLib.hideBusyMsg('viewTree');
        $('ul#root').trigger('_init'); 
    };

    function updateTree(ids) {
        if (! ids.length) {
            utilsLib.hideBusyMsg('viewTree');
            utilsLib.showWarning('No match found.');
        } else {
            // replace ids by synonyms
            app.db.view('datamanager/synonym', {
                keys: ids.unique().map(function (e) {
                    return [1, e];
                }),
                reduce: false,
                success: function(syn_data) {
                    var syns = syn_data.rows.map(function(e) {
                        return e.value.syn;
                    });
                    ids = ids.concat(syns).unique();
                    tree_struct.selected_nodes = {};
                    for (var i = 0; i < ids.length; i++) {
                        tree_struct.selected_nodes[ids[i]] = true;
                    }
                    treeLib.expand_docs(app.db, ids, tree_struct, onSuccess, onError);
                },
                error: onError
            });
        }
    }

    function searchError() {
        utilsLib.hideBusyMsg('viewTree');
        utilsLib.showError('An error occured during filtering.');
    }

}