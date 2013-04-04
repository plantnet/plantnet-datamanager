function () {
    var mms = $$(this).app.data.mms,
        mmId = $(this).attr('data-param'),
        localMms = [],
        force_eoo = false; // force existing value or empty

    if (mms) { // new databases have no mms
        for (var i = 0; i < mms.length; i++) {
            var e = mms[i];
            if (e.isref) {
                localMms.push({
                    _id: e._id,
                    name: e.name,
                    selected: e._id === mmId
                });
            }
        }
    }

    return {
        mms: localMms,
        force_eoo: force_eoo
    };
}