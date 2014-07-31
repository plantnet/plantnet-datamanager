// common functions to use in _list function


exports.csv_encode = function (data, sep) {
    data = _data_to_string(data).trim();
    data = data.replace(/\"/g, '""');
    return '"' + data + '"' + sep;
};


// parses a string to a number if possible, only if the whole string is a number
// (whereas parseFloat returns a number if the string *begins* with a number)
// WARNING: copied from fulltext/everyfield/index.js - beware of cracra redundancy
var parseNumber = function(v) {
    var f = parseFloat(v);
    if (! isNaN(f)) {
        return Number(v);
    }
    return NaN;
};

// converts some data, ignoring its "field type" (mm is not available here), to
// a string for export, as defined at http://amap-dev.cirad.fr/projects/p2pnote/wiki/Data_format_in_export_by_type
// toString() should make it but... not so sure!
var _data_to_string = function(data) {
    if (data === null || data === '') {
        return '';
    }
    if (data === 0) return '0';
    if (data === false) return 'false';
    if (_is_array(data)) {
        if (data.length == 2 && (! isNaN(parseNumber('' + data[0])))) { // geoloc
            return '[' + data[0].toString() + ',' + data[1].toString() + ']';
        } else { // multi-enum
            return data.join(',');
        }
    }
    return data.toString();
};

//copied from mustache lib and utilsLib
var _is_array = function (a) {
    return Object.prototype.toString.call(a) === '[object Array]';
};

exports.parse_param = function (param) {
    // list all field by type
    var fields = {};
    for (var m = 0; m < param.length; m++) {
        var t = param[m].$modi;
        fields[t] = fields[t] || [];
        fields[t].push([param[m].field, m]);
    }
    return fields;
};

// returns a CSV file header for a single module
exports.get_header = function (param, sep, modname, addDoubleQuotes) {
    var ret = "";
    for (var m = 0; m < param.length; m++) {

        var label = param[m].label || param[m].field;
        if (addDoubleQuotes) {
            ret += '"';
        }
        if (modname) {
            ret += modname + '.';
        }
        ret += label;
        if (addDoubleQuotes) {
            ret += '"';
        }
        ret += sep;
    }
    return ret.slice(0, -1);
};


//group documents by type for the same key
exports.group_objects = function (id, doc, fields, out_obj) {

 out_obj.id = out_obj.id || id; 
 var outdoc = {};
 // no field to extract
 if (!fields[doc.$modi]) {
     return;
 }

 // for each field to extract
 for (var f = 0; f < fields[doc.$modi].length; f++) {
     var farray = fields[doc.$modi][f][0], // field name
     colindex = fields[doc.$modi][f][1], // index
     value;

     // field descriptor is an array (for $ref)
     if (typeof(farray) === 'object') {
         try {
             value = doc[farray[0]];
             for (var sf = 1; sf < farray.length; sf++) {
                 value = value[farray[sf]];
             }
         } catch (err) {
             value = "undefined";
         }
     } else {
         value = doc[farray];
     }
     outdoc[colindex] = value; // index data by col index
 }
 
 out_obj[doc.$modi] = out_obj[doc.$modi] || [];
 out_obj[doc.$modi].push(outdoc);
};