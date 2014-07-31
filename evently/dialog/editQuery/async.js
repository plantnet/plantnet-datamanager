function (callback, e, _id, trigger, q) {

    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        db = app.db,
        mm = null,
        query = null,
        queriesByMm = {},
        tasks = 2;

    app.data.trigger = trigger;
    _id = app.libs.utils.decode_design_id(_id); // _id of mm (for a new query), or doc containing existing query

    function success() {
        tasks--;
        if (tasks == 0) {
            var ids = mmLib.get_dict_id(mm);
            mmLib.get_mms_by_id(db, ids, function(mms) {
                //$.log(mm, mms);
                callback(query, mm, mms, mmLib, queriesByMm);
            });
        }
    }

    // open the query document
    db.openDoc(_id, {
        success: function(v) {
           if (v.$type === 'mm') { // new query
               mm = v;

               if (!q) {
                   q = {
                       $criteria: [],
                       $select: '',
                       name: ''
                   };
               }
               q.$type = 'query';
               q.$mm =  v._id;

               query = q;
               success();
           } else { // existing query
               query = v;
               db.openDoc(v.$mm, {
                   success: function(localMm) {
                       mm = localMm;
                       success();
                   }
               });
           }
        }
    });

    // get available queries for all structures
    db.view('datamanager/views_queries', {
        cache: JSON.stringify(new Date().getTime()),
        startkey: ['q'],
        endkey: ['q', {}],
        include_docs: true,
        success: function(data) {
            var quer;
            for (var i=0; i < data.rows.length; i++) {
                quer = data.rows[i].doc;
                if (! (quer.$mm in queriesByMm)) {
                    queriesByMm[quer.$mm] = [];
                }
                queriesByMm[quer.$mm].push(quer);
            }
            success();
        },
        error: function() {
            $.log('Could not get views and queries definitions');
            success();
        }
    })
}