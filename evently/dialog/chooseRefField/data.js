function(mmId, refMms) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mms = [];

    for (var id in refMms) {
        if (refMms[id] !== null) { // refMms may contain ids of dictionaries that were deleted
            mms.push({
                enc_id: utilsLib.encode_design_id(id),
                name: refMms[id].name
            });
        }
    }
    
    return {
        mms: mms,
        mm_id: utilsLib.encode_design_id(mmId),
        has_mms: !!mms.length
    };
}