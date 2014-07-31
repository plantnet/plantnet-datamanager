function(callback, e, params) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        mm_id = utilsLib.decode_design_id(params.mmId),
        showSyn = params.showSyn == '0' ? false : true,
        q = params.q && params.q !== '0' ? params.q : '',
        db = app.db;

    if (app.data.tree && app.data.tree.mm._id === mm_id) {
        callback(app.data.tree.mm, app.data.tree, q, showSyn);
        return;
    }
    
    db.openDoc(mm_id, {
        success : function(mm) {
            db.view('datamanager/label', {
                key : [1, mm_id, ''],
                reduce: true,
                cache : JSON.stringify(new Date().getTime()),
                success : function(view_data) {
                    var modis = mmLib.get_modis_by_parent(mm);
                    var count = view_data.rows.length ? view_data.rows[0].value : 0;
                    var treeStructure = {
                        _id: '',
                        label: mm.name,
                        type_label: 'root',
                        count: count,
                        sons: [],
                        data: [{key : 'Name', value : mm.name}],
                        submodis: modis[''],
                        // specific data
                        by_id: {},
                        modis: modis,
                        mm: mm,
                        selected_nodes: {}
                    };
                    treeStructure.by_id[''] = treeStructure;
                    
                    callback(mm, treeStructure, q, showSyn);
                }
            });
        }
    });
}