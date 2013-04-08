function (head, req) {

    //var view_cols = req.query.cols;
    var filename = req.query.fn,
        separator = req.query.separator,
        //encoding = req.query.encoding,
        expand_geoloc = JSON.parse(req.query.expand_geoloc),
        export_synonymy = JSON.parse(req.query.export_synonymy),
        libpath = require("views/lib/path"),
        lib = require('vendor/datamanager/lib/commonddoc'),
        mmlib = require('vendor/datamanager/lib/mm');

    if (! separator) {
        separator = ',';
    }

    // return csv data
    function format(docs_by_modi, cols, current_modi) {
        var ret = "", field, modi, type, d, data;
        for (var m = 0, l = cols.length; m < l; m++) {
            field = cols[m].field;
            modi = cols[m].$modi;
            type = cols[m].type;

            //log('cols[m]: ' + JSON.stringify(cols[m]));
            if (modi) {
                data = '';
                // if same parent
                if (current_modi.slice(0, modi.length) === modi) {
                    d = docs_by_modi[modi];
                    if (d) {
                        if (type == 'geoloc' && expand_geoloc) { // dans ce cas les champs finissent par _lon ou _lat
                            var suffix = field.substring(field.length - 4),
                                root = field.substr(0, field.length - 4);
                            //log("\ntrouvé géoloc:: root=" + root + ", suffix=" + suffix + "\n");
                            if ((d[root]) && (d[root].length == 2)) {
                                if (suffix == '_lon') {
                                    data = d[root][0];
                                } else if (suffix == '_lat') {
                                    data = d[root][1];
                                }
                            }
                        } else { // cas général
                            if (d[field] !== undefined) {
                                data = d[field];
                            }
                        }
                    }
                }
    
                ret += lib.csv_encode(data, separator);
            }
        }
        return ret.slice(0, -1); //remove last ";"
    }

    start({
        "headers": {
            "Content-Type": "application/force-download",
            //"Content-Type": "text/csv; charset=ISO-8859-1",
            "Content-disposition": "attachment; filename=" + filename,
            "Pragma": "no-cache", 
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0, public",
            "Expires": "0"
        }
    });

    var row, doc, key, id, cache = {}, view_cols = [];

    while ((row = getRow())) {
        key = row.key;
        id = row.id;

        // parse column
        if (key[1] === 0) {
            view_cols = mmlib.mm_to_view(row.doc, false, expand_geoloc, export_synonymy);
            send(lib.get_header(view_cols, separator) + "\n");
            //log('VIEW COLS: ' + JSON.stringify(view_cols));
            continue;
        }

        var a;
        // attachments
        row.doc._attchs_files = [];
        row.doc._attchs_urls = [];
        for (a in row.doc._attachments) {
            row.doc._attchs_files.push(a);
        }
        for (a in row.doc.$attachments) {
            row.doc._attchs_urls.push(a);
        }
        doc = row.doc;

        var parent = libpath.get_parent(row.doc);
        if (!parent) {
            cache = {};
        }
        cache[doc.$modi] = doc;

        var line = format(cache, view_cols, doc.$modi);
        if (line) {
            send(line + "\n");
        }
    }
}