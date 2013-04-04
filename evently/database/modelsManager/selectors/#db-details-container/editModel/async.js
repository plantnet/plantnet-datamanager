function(callback, e, params) {
	var app = $$(this).app,
        mmId = app.libs.utils.decode_design_id(params.mmId),
        mmLib = app.getlib('mm');
    
	mmLib.get_mms(app.db, function(mms) {
	    for (var i = 0, l = mms.length; i < l; i++) {
	        if (mms[i]._id === mmId) {
	            mms[i].id = mms[i]._id.slice(8);
	            callback(mms[i], mms);
	            break;
	        };
        };
	});
};
