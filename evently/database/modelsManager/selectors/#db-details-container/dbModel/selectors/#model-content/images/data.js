function (attachments, mm_id, skip, limit, nbattachments, appletRunning, type, id, docLabel) {

    var app = $$(this).app,
        db = app.db,
        cacheLib = app.getlib('cache');

    if (id == '0' && type != 'modt') {
        id = false;
    }

    var urls = attachments.rows.map(
        function (e) {
            var u = e.value;
            if (u.url.slice(0,4) != "http") {
                u.url = db.uri + "/" + u.url;
            }
            u.id = e.id;
            if (! u.fn) { // for img pointing to http urls
                u.fn = u.url;
            }
            // basename
            u.bn = u.fn;
            var lio = u.fn.lastIndexOf('/');
            if (lio > -1) {
                u.bn = u.fn.substr(lio + 1);
            }
            return u;
        });

    // current elements
    var eltstart = skip;
    var eltend = eltstart + limit;
    var nextskip = skip + limit;
    if(attachments.rows.length < limit) {
        nextskip = null;
        eltend = eltstart + attachments.rows.length;
    }
    eltstart = eltstart+1;
    var prevskip = skip - limit;
    var prevexists = true;
    if (prevskip < 0) {
    	prevexists = false;
    }
    var lastskip = nbattachments - (nbattachments % limit);
    var current_page = (skip / limit) +1;
    var total_pages = Math.floor(nbattachments / limit) + 1;

    // direct links to pages
    var pagesBefore = [],
        pagesAfter = [];
    if ((total_pages <= 10) || (current_page <= 5)) {
    	for (var i=1; i<current_page; i++) {
    		pagesBefore.push({ pn: i, lskip: (skip - ((current_page - i) * limit)) });
    	}
    	for (var i=(current_page + 1); i<= Math.min(total_pages, 10); i++) {
    		pagesAfter.push({ pn: i, lskip: (skip + ((i - current_page) * limit)) });
    	}
    } else {
    	if (current_page >= (total_pages - 5)) {
    		for (var i=(total_pages - 9); i<current_page; i++) {
        		pagesBefore.push({ pn: i, lskip: (skip - ((current_page - i) * limit)) });
        	}
        	for (var i=(current_page + 1); i<= total_pages; i++) {
        		pagesAfter.push({ pn: i, lskip: (skip + ((i - current_page) * limit)) });
        	}
    	} else {
    		for (var i=(current_page - 4); i<current_page; i++) {
        		pagesBefore.push({ pn: i, lskip: (skip - ((current_page - i) * limit)) });
        	}
        	for (var i=(current_page + 1); i<= (current_page + 5); i++) {
        		pagesAfter.push({ pn: i, lskip: (skip + ((i - current_page) * limit)) });
        	}
    	}
    }

    var isMod = (type == 'modi' || type == 'modt'),
        isParent = (id && (type != 'modi' && type != 'modt')),
        modelName = cacheLib.get_cached_mm(app, '_design/' + mm_id).name,
        moduleName = (id ? cacheLib.get_name(app, '_design/' + mm_id, id) : '');

    //$.log('type', type, 'id', id, 'docLabel', docLabel, 'isMod', isMod, 'isParent', isParent, 'moduleName', moduleName, 'modelName', modelName);

    return  {
        urls : urls,
        noimage : !urls.length,
        nextskip : nextskip,
        lastskip : lastskip,
        prevskip : prevskip,
        prevexists : prevexists,
        eltstart : eltstart,
        eltend : eltend,
        page : current_page,
        total_pages : total_pages,
        pagesBefore: pagesBefore,
        pagesAfter: pagesAfter,
        nbattachments : nbattachments,
        appletRunning : appletRunning,
        mm_id : mm_id,
        modelName: modelName,
        type: type,
        isMod: isMod,
        moduleName: moduleName,
        isParent: isParent,
        id: id,
        label: docLabel
    };
}