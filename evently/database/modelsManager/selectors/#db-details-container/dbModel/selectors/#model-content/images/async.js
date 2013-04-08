function (callback, e, params) {
    var app = $$(this).app,
        time = JSON.stringify(new Date().getTime()),
        mm_id = params.mmId,
        type = params.type,
        id = params.id,
        skip = params.skip,
        limit = 100; // @TODO give the user the choice?

    skip = skip ? parseInt(skip) : 0;

    var dec_mm_id = app.libs.utils.decode_design_id(mm_id);

    var attachments = null,
        nbattachments = null,
        docLabel = null,
        appletResponse = null;

    function cb1 (returnedAttachments) {
        attachments = returnedAttachments;
        next();
    }

    function cb2 (returnedNbattachments) {
        if (returnedNbattachments.rows[0]) {
            nbattachments = returnedNbattachments['rows'][0]['value'];
        } else {
            nbattachments = 0;
        }
        next();
    }

    var options = {
        cache : time,
        skip : skip,
        limit : limit,
        reduce : false,
        success: cb1
    };

    if (type == 'parent') {
        options.startkey = [2, id, ""];
        options.endkey = [2, id, {}];
    } else if (type == 'modi' || type == 'modt') {
        options.startkey = [dec_mm_id, id, ""];
        options.endkey = [dec_mm_id, id, {}];
    } else {
        options.startkey = [1, dec_mm_id], // Startkey et Hutch, lalalalalalalaaa
        options.endkey = [1, dec_mm_id, {}];
    }
    app.db.view('datamanager/attachments', options);

    // count total number of images
    options.reduce = true;
    options.success = cb2;
    delete options.skip;
    delete options.limit;
    app.db.view('datamanager/attachments', options);

    // try to get doc label if parent is a regular doc
    if (type == 'parent') {
        app.db.view('datamanager/label', {
            key: [0, id],
            reduce: false,
            success: function(data) {
                docLabel = data.rows[0].value.label;
                next();
            },
            error: function(err) {
                docLabel = '??';
                next();
            }
        });
    } else {
        docLabel = '_'; // ça ou autre chose...
    }

    // test if applet is running on port 5990
    $.ajax({
        url : 'http://localhost:5990/phoneHome',
        dataType: 'json',
        success:  function(data) {
            $.log('success', data);
        },
        error : function(data) {
            if (data.responseText) {
                appletResponse = true;
            } else {
                appletResponse = false;
            }
            next();
        }
    });

    function next() {
        if (nbattachments != null && attachments != null && appletResponse != null && docLabel !== null) {
            callback(attachments, mm_id, skip, limit, nbattachments, appletResponse, type, id, docLabel);
        }
    }
}