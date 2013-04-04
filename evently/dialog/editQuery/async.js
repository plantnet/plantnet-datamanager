function (callback, e, _id, trigger, q) {
    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        db = app.db;
    $.log('Dans async.js de editQuery');
    app.data.trigger = trigger;
    _id = app.libs.utils.decode_design_id(_id); // _id of mm (for a new query), or doc containing existing query

    function success(mm, query) {
        var ids = mmLib.get_dict_id(mm);
        mmLib.get_mms_by_id(db, ids, function(mms) {
            //$.log(mm, mms);
            callback(query, mm, mms, mmLib);
        });
    }

    db.openDoc(_id, {
        success: function(v) {
           if (v.$type === 'mm') { // new query
               var mm = v;
               
               if (!q) {
                   q = {
                       $criteria: [],
                       $select: '',
                       name: ''
                   };
               }
               q.$type = 'query';
               q.$mm =  v._id;
               success(mm, q);
           } else { // existing query
               var query = v;
               db.openDoc(v.$mm, {
                   success: function(mm) {
                       success(mm, query);
                   }
               });
           }
        }
    });
}