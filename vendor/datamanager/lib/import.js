var utils = require("vendor/datamanager/lib/utils"),
    AtLib = require("vendor/datamanager/lib/attachments"),
    Query = require("vendor/datamanager/lib/query");


// import CSV DATA
function set_path(modi, new_docs, mm) {

    // return path if already set
    if (new_docs[modi] && new_docs[modi].$path) { 
        return new_docs[modi].$path;  
    }

    var parent_modi = mm.structure[modi][1],
        parent_path, path, parent_id;

    if (parent_modi) { // no root doc
        parent_path = set_path(parent_modi, new_docs, mm);
        parent_id = new_docs[parent_modi] ? new_docs[parent_modi]._id : null;
        path = parent_path.concat([parent_id]); // copy obj

    } else { // no parent -> root doc
        path = [];
    }

    if (new_docs[modi]) {
        new_docs[modi].$path = path;
        new_docs[modi]._id = utils.build_id(new_docs[modi]);
    }

    return path;
}



// set $path in imported doc

// regroup docs based on indexed fields
// index_field is a map by modi containing the field to index
function index_docs(new_docs, index_field, full_index) {
    
    var doc_index = {};
    // create index for each doc
    for (modi in new_docs) {
        var d = new_docs[modi], 
        id = "";
        for (field in index_field[modi]) {
            id += d[field];
        }

        if (id) { doc_index[modi] = id; }
    }


    for (modi in new_docs) {
        var smodi = modi.split("."), findex = "";
        // compute full index (included parent modi)
        for (var i = smodi.length; i >= 2; i--) {
            var pmodi = smodi.slice(0, i).join(".");
            var tmp = doc_index[pmodi];
            if(tmp) { findex += tmp; }
            else { break; } 
        }

        if (!findex) { continue; }

        // test doc exist
        if (full_index[findex]) {
             new_docs[modi] = full_index[findex];
        } else {
            full_index[findex] = new_docs[modi];
        }
    }
    //$.log(full_index);
}

// save doc from parsed csv_data
// col map : list of objects representing cols (contains fields name, modi and type)
exports.import_csv = function (db, csv_data, mm, col_map, withConflicts, onSuccess, onError, showMsg) {

    showMsg = showMsg || function () {};

    showMsg("Parsing data...");
    var docs = exports.parse_docs(csv_data, mm, col_map);
    if (!docs.length) {
        onError("0", "Nothing imported", "");
        return;
    }

    var attchs_err = [];

    function save_all () {

        if(attchs_err.length > 0) {
            //onError ("Missing attachments", "", "", attchs_err);
            //return;
            showMsg('Warning: ' + attchs_err.length + ' attachment(s) could not be imported!');
        }

        // save data
        showMsg("Uploading data...");

        db.bulkSave({docs : docs, 'all_or_nothing' : withConflicts}, {
            success : function (results) {
                showMsg("Updating meta data...");
                db.dm("update_mm", {mm : mm._id}, null, function() {
                    onSuccess();
                    db.dm("match_ref_mm", {mm : mm._id}); 
                }, onError);    
                
                Query.triggerLuceneIndex(db);
            },
            error : onError
        });
    }

    // organise doc by attch
    var attch_docs = {};
    for (var i = 0; i < docs.length; i++) {
        var d = docs[i];
        if (d.$local_file) {
            var a = d.$local_file,
                spa = a.split(',');
                // "a" may contain several attachments separated by ','
            //$.log('splitted', a, 'into', spa);
            for (var j=0; j < spa.length; j++) {
                //$.log('adding', spa[j]);
                attch_docs[spa[j]] = attch_docs[spa[j]] || [];
                attch_docs[spa[j]].push(d);
            }
        }
    }

    var attchs = utils.keys(attch_docs);
    //$.log('ATTCHS', attchs);

    if(!attchs.length) {
        save_all();
    } else {
         attchs.asyncForEach( function (a, next) {
             showMsg('Get attachment(s): ' + a);
             //$.log('getting', a);
             AtLib.get_local_file(
                 a, function(data) {
                     // encode
                     data.data = AtLib.arrayBufferTobase64(data.data);
                     // store attachment in doc
                     for (var id = 0; id < attch_docs[a].length; id++) {
                         var d = attch_docs[a][id];
                         d._attachments = d._attachments || {};
                         d._attachments[a] = {
                             content_type : data.type,
                             data : data.data
                         };
                     }
                     next();
                 }, function (err) {
                     attchs_err.push(err);
                     next();
                 });
         }, function () {
             save_all();
         });
    }
};


// get doc from csv_data (2 dim array)
// return parsed docs
exports.parse_docs = function (csv_data, mm, col_map) {
    //csv_data = csv_data.unique();

    var nbcols = col_map.length,
        new_docs,
        doc,
        all_docs = {},
        docs = [],
        cmlength = col_map.length,
        index_field = {}, // keep field to index by modi
        full_index = {},
        doc_syn_ids = {}; // for synonym
        
    // for each column
    for (var c = 0; c < cmlength; c++) {
        var modi = col_map[c].modi,
            field = col_map[c].field,
            index = col_map[c].is_index;
        
        // keep the field to index
        if(index) {
            index_field[modi] = index_field[modi] || {};
            index_field[modi][field] = true;
        }
    }


    // for each line
    for (var i = 1, l = csv_data.length; i < l; i++) {
        var data = csv_data[i];

        new_docs = {};
        
        // for each column
        for (var c = 0; c < cmlength; c++) {

            var modi = col_map[c].modi,
                field = col_map[c].field,
                type = col_map[c].type,
                value = data[c];

            // ignored column
            if (!modi || !field || !value) { continue; }

            value = value.trim();
            value = utils.readWidget(value, type);

            if (new_docs[modi]){
                // already created doc in this line
                doc = new_docs[modi];
            } else {
                // new doc
                var modt = mm.structure[modi][0],
                label_tpl = mm.modules[modt].label_tpl,
                index_tpl = mm.modules[modt].index_tpl,
                doc = {
                    $mm: mm._id,
                    $modi: modi,
                    $modt: modt,
                    $index_tpl : (index_tpl && label_tpl) ? index_tpl : "",
                    $label_tpl : label_tpl,
                    $meta : { 
                        created_at : new Date().toString(),
                        created_by : "CSV IMPORT",
                    }
                };
            }

            // keep doc ref
            new_docs[modi] = doc;

            // add value
            switch (field) {
            case "$attachment":
                if (!doc.$attachments) { doc.$attachments = {}; }
                doc.$attachments[value] = {url: value};
                break;

            case "$local_file":
                doc.$local_file = value;
                break;

            case "$synid":
                doc.$synonym = value;
                break;

            case "$id":
                doc.$id = value;
                break;

            default:
                new_docs[modi][field] = value;
                break;
            }
        } // for each col
       
        // regroup doc 
        index_docs(new_docs, index_field, full_index);

        for (var modi in new_docs) {
            
            set_path(modi, new_docs, mm);

            doc = new_docs[modi];
            all_docs[doc._id] = doc; // ensure doc is not duplicated
            if(doc.$id) {
                doc_syn_ids[doc.$id] = doc._id; // replace internal id with real id
                delete doc.$id;
            }
        }
    }

    // update syns
    for(var key in all_docs) {
        var d = all_docs[key];
        
        if(d.$synonym) {
            d.$synonym = doc_syn_ids[d.$synonym];
        }
        docs.push(d);
    }

    return docs;
};


// FROM http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
exports.CSVToArray = function (strData, strDelimiter ) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );
    
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec( strData ))){
        
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];
        
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)){           
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );
        }
                
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );
            
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }
        
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    
    // Return the parsed data.
    return( arrData );
};