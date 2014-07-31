function(callback, e, _id, trigger) {
    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        dbLib = app.db;

    app.data.trigger = trigger;

    function success(mm, view) {
        var ids = mmLib.get_dict_id(mm);
        mmLib.get_mms_by_id(dbLib, ids, function(mms) {
             callback(view, mm, mms, mmLib);
        });
    }

    _id = app.libs.utils.decode_design_id(_id);
    dbLib.openDoc(_id, {
        success: function(v) {
            if (v.$type === 'mm') {
                var mm = v,
                    view = {
                        $type: 'view',
                        $mm: v._id,
                        $cols: [],
                        name: ''
                    };
                success(mm, view);
            } else {
                var view = v;
                dbLib.openDoc(v.$mm, {
                    success: function(mm) {
                        success(mm, view);
                    }
                });
            }
        }
    });
}