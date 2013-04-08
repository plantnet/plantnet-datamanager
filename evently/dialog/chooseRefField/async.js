function(callback, e, mmId) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmLib = app.getlib('mm'),
        refMms = [];

    mmId = utilsLib.decode_design_id(mmId);

    app.db.openDoc(mmId, {
       success: function(mm) {
           var refFields = mmLib.get_ref_fields(mm);
           for (var i in refFields) {
               for (var f in refFields[i]) {
                   refMms.push(refFields[i][f]);
               }
           }
           refMms = refMms.unique();
           mmLib.get_mms_by_id(app.db, refMms, function(mms) {
               callback(mmId, mms);
           });
       }
   });
}