function (head, req) {

    //var view_cols = req.query.cols;
    var filename = req.query.fn,
        separator = req.query.separator,
        //encoding = req.query.encoding,
        expand_geoloc = JSON.parse(req.query.expand_geoloc),
        label_field = true,
        id_field = false,
        export_synonymy = JSON.parse(req.query.export_synonymy),
        libpath = require("views/lib/path"),
        lib = require('vendor/datamanager/lib/commonddoc'),
        mmlib = require('vendor/datamanager/lib/mm');

    if (req.query.include_label !== 'undefined') {
        label_field = JSON.parse(req.query.include_label);
    }
    if (req.query.include_id !== 'undefined') {
        id_field = JSON.parse(req.query.include_id);
    }

    if (! separator) {
        separator = ',';
    }

    // return csv data
    function format(docs_by_modi, cols, current_modi) {
        var ret = "",
            field,
            modi,
            type,
            d,
            data;
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
                        } else if ((field == '_attchs_urls') || (field == '_attchs_files')) { // attachments are arrays but must be separated by "\n" and not ","
                            data = '';
                            if (d[field] && (Object.prototype.toString.call(d[field]) === '[object Array]')) {
                                for (var i=0; i < d[field].length; i++) {
                                    data += d[field][i];
                                    if (i < d[field].length - 1) {
                                        data += "\n";
                                    }
                                }
                            } else {
                                data = d[field];
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

    var row,
        doc,
        key,
        cache = {},
        view_cols = [];

    while ((row = getRow())) {
        key = row.key;

        // parse column
        if (key[1] === 0) {
            view_cols = mmlib.mm_to_view(row.doc, false, expand_geoloc, export_synonymy, label_field, id_field);
            // log(view_cols);
            send(lib.get_header(view_cols, separator, false, true) + "\n");
            // log('VIEW COLS: ' + JSON.stringify(view_cols));
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