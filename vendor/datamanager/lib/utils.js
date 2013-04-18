require('vendor/datamanager/lib/commons');

// call a couchdb update function
var _update_handler = function(name, docid, params, onSuccess, onError) {
    name = name.split('/');
    
    var url = this.uri + '_design/' + name[0] + '/_update/' + name[1];

    if (docid) {
        url +=  '/' + encodeURIComponent(docid);
    }

    $.ajax({
        url: url,
        timeout: 10000,
        dataType: 'json',
        data: JSON.stringify(params),
        processData: false,
        type: docid ? 'PUT' : 'POST',
        success: onSuccess,
        error : onError
    });
};

// purge_data : { id : [rev_list]}
var _purge_docs = function (purge_data, onSuccess, onError) {
    var db = this;
    $.ajax({
        url: db.uri + '_purge',
        timeout: 10000,
        dataType: 'json',
        data: JSON.stringify(purge_data),
        contentType: 'application/json',
        type: 'POST',
        success: onSuccess,
        error : onError
    });

}

// call a server side dm function
var _dm_handler = function(action, params, data, onSuccess, onError, timeout, onComplete) {

    var url =  '/_dm/' + this.name +  "/" + action;
    if(params) {
        var p = [];
        for(var k in params) {
            p.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
        }

        url += "?" + p.join("&");
    }

    if (! timeout) timeout = 1000000; // default timeout of 16mn+
    onComplete = onComplete || function() {};

    $.ajax({
        url: url,
        timeout: timeout,
        dataType: 'json',
        data: data ? JSON.stringify(data) : null,
        processData: false,
        type: data ? 'POST' : 'GET',
        success: onSuccess,
        error : onError,
        complete: onComplete
    });
};

// call admin db service
exports.admin_db = function(db, action, params, onSuccess, onError) {
    var url = db.uri + '_admin_db?action=' + action;
    for (var k in params) {
        url += '&' + k + '=' + params[k];
    }
    
    $.ajax({
        url: url,
        dataType: 'json',
        success:  onSuccess,
        error: function(data) {                                   
            data = JSON.parse(data.responseText);
            onError(data.error);
        }  
    });
};

// kind of singleton that retrieves a doc only if it was modified
var _open_cached_doc = (function() {
    var instance = null;

    function updateDoc(app, id, cb, errcb) {
        var headers = {};
        if (instance !== null) {
            headers['if-none-match'] = '"' + instance._rev + '"';
        }
    
        $.ajax({
            url: app.db.uri + $.couch.encodeDocId(id),
            headers: headers,
            async: false,
            dataType: 'json',
            success: function(data, text, req) {
                var status;
                if (req.status == '304') {
                    //$.log('not modified!');
                    status = 'not modified';
                } else {
                    //$.log('new version received', data);
                    instance = data;
                    status = 'new';
                }
                cb(instance, status);
            },
            error: function(data) {
                if (errcb) {
                    errcb(data);
                } else {
                    throw new Error('Error retrieving doc');
                }
            }
        });
    }
    
    return function(app, id, cb, errcb) {
        updateDoc(app, id, cb, errcb);
    };
})();

// shortcut function to load a lib in vendor
var _getlib = function(libName) {
    return this.require('vendor/datamanager/lib/' + libName);
};

// init global variables and caches all mms
exports.init_app = function(app, callback) {

    var cpt = 2,
        cacheLib = app.require('vendor/datamanager/lib/cache');

    // App initialization
    app.config = {
         page_size : 50,
         colors: ['#a9a9a9', '#4f8e26', '#ff7500', '#5b9af8', '#ffe200', '#ff8080',
                  '#835e21', '#05fc4d', '#ff0000', '#40ebdb', '#686868', '#4144d6']
    };

    app.db.update = _update_handler;
    app.db.dm = _dm_handler;
    app.db.purge = _purge_docs;
    app.db.open_cached_doc = _open_cached_doc;
    app.getlib = _getlib;
    
    app.data = {};
    app.tmp = {};
    
    app.infos = {
        currentPath: '',
        model: {
            activeView: '',
            id: '',
            isRef: false,
            name: ''
        },
        module: {
            id: '',
            instance: {
                id: '',
                //addDocPossible: false // info is now in cached_mm.addProneModules
            }
        },
        filter_id: '', // for queries
        view: {
            id: '',
            name: ''
        }
    };

    function finish() {
        if (cpt == 0) {
            // Start app
            callback(app);
        }
    }

    // put all mms in cache
    cacheLib.init_all_mms(app, function() {
        cpt--;
        finish();
    });

    // User infos
    $.couch.session({
        success: function(response) {
            var userCtx = response.userCtx;
                dbRoles = userCtx.roles,
                dbName = app.db.name,
                userRole = '',
                userSuperAdmin = (dbRoles.indexOf('_admin') > -1) ? true : false;
        
            // Get current Db user role
            if (dbName != 'datamanager') {
                for (var i = 0; i < dbRoles.length; i++) {
                    var dbUserRole = dbRoles[i];
                    if (dbUserRole.indexOf(dbName) > -1) {
                        userRole = dbUserRole.substring(dbUserRole.indexOf('.') + 1);
                    }
                }
            }

            // Update userCtx
            userCtx.currentDbRole = userRole;
            userCtx.isSuperAdmin = userSuperAdmin;

            // Set app user infos
            app.userCtx = userCtx;
            app.info = response.info;

            cpt--;
            finish();
        }
    });
};

// scroll to top
/**
 *@deprecated use lib html.js with function scrollToTop() instead of this function
 */
exports.top = function() {
    $('html, body').animate({scrollTop: 0}, 'fast');
    return exports;
};

/*----------------------------------------------------------------------------------------------------------*/
// ALERT MESSAGES

var _showMsg = function(msg, style) {
    var msgOutput = $(
        '<div class="' + style + ' alert">' +
            '<button type="button" class="close" data-dismiss="alert">×</button>' +
            msg +
        '</div>');
    msgOutput.appendTo('#msg-bloc').fadeIn('fast');
    
    $('.close', msgOutput).on('click', function() {
        msgOutput.remove();
    });
    
    setTimeout(function() {
        msgOutput.fadeOut('fast', function() {$(this).remove();});
    }, 7000);
    
    return exports;
};

exports.showSuccess = function(msg) {
    _showMsg(msg, 'alert-success');
    return exports;
};

exports.showError = function(msg) {
    _showMsg(msg, 'alert-error');
    return exports;
};

exports.showWarning = function(msg) {
    _showMsg(msg, '');
    return exports;
};

exports.showInfo = function(msg) {
    _showMsg(msg, 'alert-info');
    return exports;
};

/**
 *@deprecated use showSuccess() instead of this function
 */
exports.show_msg = function(msg) {
    $.log('deprecated use showSuccess() instead of show_msg function');
    exports.showSuccess(msg);
    return exports;
};

/**
 *@deprecated use showError() instead of this function
 */
exports.show_err = function(msg) {
    $.log('deprecated use showError() instead of show_err function');
    exports.showError(msg);
    return exports;
};

/*----------------------------------------------------------------------------------------------------------*/
// BUSY MESSAGES

exports.showBusyMsg = function(msg, busyById, excludeOther) {
    var busyElement = $('#busy-bloc'),
        busyMsgElement = $('#busy-msg');

    busyMsgElement.html(msg);
    if (excludeOther) {
        busyElement.removeData();
    }
    busyElement.data(busyById, 'true').show();
    return exports;
};

exports.hideBusyMsg = function(busyById) {
    var busyElement = $('#busy-bloc');

    busyElement.removeData(busyById);
    if (exports.objectEmpty(busyElement.data())) {
        busyElement.hide();
    }
    return exports;
};

/**
 *@deprecated use showBusyMsg() instead of this function
 */
exports.show_busy = function(busyBy, excludeOther) {
    $.log('show_busy deprecated use showBusyMsg() instead of this function');
    var busyElement = $('#busy-bloc');
    if (excludeOther) {
        busyElement.removeData();
    }
    busyElement.data(busyBy, 'true').show();
    return exports;
};

/**
 *@deprecated use hideBusyMsg() instead of this function
 */
exports.hide_busy = function(busyBy) {
    $.log('hide_busy deprecated use hideBusyMsg() instead of this function');
    var busyElement = $('#busy-bloc');
    busyElement.removeData(busyBy);
    if (!$.hasData(busyElement)) {
        busyElement.hide();
    }
    return exports;
};

/*----------------------------------------------------------------------------------------------------------*/
// MODAL WINDOWS

exports.convertTargetIdToDialogName = function(id) {
    id = id.slice(1);
    id = id.replace(/-/g, ' ');
    id = id.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    id = id.charAt(0).toLowerCase() + id.substr(1);
    id = id.replace(/ /g, '');
    return id;
}

exports.show_dialog = function() {
    $('#dialog-overlay').show();
    $('#dialog-bloc').css('display', 'inline-block');
    //exports.top();
    return exports;
};

exports.hide_dialog = function() {
    $('#dialog-bloc').hide();
    $('#dialog-overlay').hide();
    return exports;
};

/*----------------------------------------------------------------------------------------------------------*/
// APPLICATION INITIALISATION

// Don't use init_page() : use this with Bootstrap
exports.initAppData = function(app) {
    app.data = {}; // delete data
    return exports;
};

//Don't use init_page() with Bootstrap, use initAppData()
exports.init_page = function(app) {
    $('#msg-bloc').empty();
    exports.initAppData(app);
    exports.hide_dialog();
    return exports;
};

/*----------------------------------------------------------------------------------------------------------*/
// 

// get the id which can be pass as a path.binder parameter
exports.encode_design_id = function(id) {
    if (id[0] === '_' && id[7] === '/') {
        return id.replace('_design/', '');  
    }
    return id;
};
    
// get the real id for an mm (adds '_design/' at the beginning)
exports.decode_design_id = function(id) {
    if (id[0] === 'm' && id[2] === '_' && (id.indexOf('#' == -1))) {
        return '_design/' + id;  
    }
    return id;
};

// get an uniq for obj
// COMPLEXITY O(n)
exports.get_uniq_key = function(obj) {
    var i = 0;
    while (obj[i]) {
        i++;
    }
    return i + '';
};

// class to trigger event
exports.Trigger = function(obj, event, param, pathbinder) {
      this.obj = obj;
      this.event = event;
      this.param = param;
      this.pathbinder = pathbinder;
};

exports.Trigger.prototype.trigger = function(id) {
    var c = this;
    if (c.pathbinder) {
        if(c.pathbinder === true) {
            $.pathbinder.begin();
        } else {
            if (c.pathbinder[c.pathbinder.length - 1] === '/') {
                // add id if incomplete path //uiik
                c.pathbinder = c.pathbinder + id;
            }
            $.pathbinder.go(c.pathbinder);
        }
        if (!c.obj) return;
    }
    if (!c.param && id) {
        c.param = [{ id : id}];
    }
    c.obj.trigger(c.event, c.param);
};


/*----------------------------------------------------------------------------------------------------------*/
// CONVERT AND FORMAT

// Add a 0 digit for number under 10
exports.pad = function(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// convert val to type
exports.convert = function(val, type) {
    try {
        switch (type) {
            // et les bool?
            case 'integer':
                return parseInt(val);
            case 'float' :
                return parseFloat(val);
            case 'date' :
                return exports.formatDate(val);
            case 'geoloc' : return val.split(',').map(
                function(e) {
                    return parseFloat(e);
                });
            default:
                return val;
        }
    } catch (x) {
        return val;
    }
};

exports.formatDate = function(dateString) {
    var dateProcessed = '',
        date = new Date(dateString);
    if (date) {
        dateProcessed = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }
    return dateProcessed;
}

exports.formatDateTime = function(dateTimeString) {
    var dateProcessed = '',
        date = new Date(dateTimeString);
    if (date) {
        dateProcessed = date.getFullYear() + '-' + exports.formatTwoDigit((date.getMonth() + 1)) + '-' + exports.formatTwoDigit(date.getDate());
        dateProcessed += ' ' + date.getHours() + ':' + exports.formatTwoDigit(date.getMinutes()) + ':' + exports.formatTwoDigit(date.getSeconds());
    }
    return dateProcessed;
}

exports.formatTwoDigit = function(number) {
    return number < 10 ? '0' + number : '' + number;
}

exports.no_accent = function(s) {
    return s.replace(/[àâä]/gi, 'a')
        .replace(/[éèêë]/gi, 'e')
        .replace(/[îï]/gi, 'i')
        .replace(/[ôö]/gi, 'o')
        .replace(/[ùûü]/gi, 'u')
        .replace(/ /gi, '_');
};

exports.escape = function(inputString) {
    if (inputString && typeof(inputString) === 'string') {
        inputString = inputString.replace(/&(?!\w+;)|["<>\\]/g, function(character) {
            switch(character) {
                case '&': 
                    return '&amp;';
                case '\\':
                    return '\\\\';
                case '"':
                    return '\"';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                default:
                    return character;
            }
        });
        
        inputString = inputString.replace(/\n/ig, '<br/>');
    }
    return inputString;
};

//TODO: plutôt que d'utiliser cette méthode, utiliser la régle CSS3 text-overflow: ellipsis
//reduces the string "s" to "width" chars, adds "..." in the middle, keeps the extension
exports.shorten = function(s, width) {
    var l = s.length,
        shortened = s,
        ext = s.substring(s.lastIndexOf('.')),
        extLen = ext.length,
        demi = Math.floor((width-3-extLen)/2);
    if (l > width) {
        shortened = s.substring(0, demi) + '...' + s.substr((l-demi-extLen), demi+extLen);
    }
    return shortened;
};

exports.formatFieldValue = function(value, type, doSomeHTML) {
    var returnValue = value,
        hasValue = exports.isNotEmpty(value, type);

    if (doSomeHTML == undefined) doSomeHtml = true;

    if (hasValue) {
        if (type == 'boolean') {
            if (value === true) {
                returnValue = 'yes';
            } else if (value === false) {
                returnValue = 'no';
            } else if (value === '' || value === undefined) {
                returnValue = '';
            }
        } else if (type == 'url') {
            if (doSomeHTML) {
                returnValue = '<a href="' + value + '" target="_blank">' + value + '</a>';
            }
        } else if (type == 'multi-enum') {
            returnValue = value.toString().replace(/,/g, ', ');
        } else if (type == 'geoloc') {
            returnValue = value[0] + ', ' + value[1];
        } else if (type == '$meta') {
            returnValue = JSON.stringify(value, null, 2);
        }
    }

    return returnValue;
};

exports.rgb2hex = function (rgb) {
    // found on http://stackoverflow.com/questions/1740700/get-hex-value-rather-than-rgb-value-using-jquery
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
    function hex(x) {
        return ('0' + parseInt(x).toString(16)).slice(-2);
    }
    return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

/*----------------------------------------------------------------------------------------------------------*/
// PATH FUNCTION 
var _p = require('views/lib/path');

// build doc id
exports.build_id = function(doc) {
    if(!doc.$index_tpl) { 
        return doc.$mm.slice(8) + "##" + $.couch.newUUID (50);
    }

    return _p.build_id(doc);
};

exports.get_parent = _p.get_parent;

exports.get_root = function (doc) {
    var sp = doc.$path, i=0, ret;
    while(sp && i < sp.length && !ret) {
        ret = sp[i];
        i++
    }
    
    return ret || doc._id;
};


// return parent modi
exports.get_parent_modi = function(doc) {
    var pmodi = doc.$modi;
    if (pmodi) {
        var p = pmodi.split('.');
        p = p.slice(0, p.length - 1);
        pmodi = p.join('.');
    }
    return pmodi;
};

exports.keys = function(obj) {
    var ret = [];
    for (k in obj) {
        ret.push(k);
    }
    return ret;
};

exports.values = function(obj) {
    var ret = [];
    for (k in obj) {
        ret.push(obj[k]);
    }
    return ret;
};



/*----------------------------------------------------------------------------------------------------------*/
// VAR TESTING

exports.isNotEmpty = function(value, type) {
    var hasValue = false;
    if (((type == 'float' || type == 'integer' || type == 'range') && value === 0)
        || (type == 'boolean' && (value === false || value === true))
        || (value !== '' && value !== undefined && value !== null)) {
        hasValue = true;
    }
    return hasValue;
};

exports.isEmpty = function(value, type) {
    return ! exports.isNotEmpty(value, type);
};

// returns error message if name is a number, or a forbidden word
// returns null if everything is OK
exports.validateName = function (name) {
    name = '' + name;
    if (! isNaN(parseFloat(name[0]))) {
        return 'may not start with a number';
    }
    if (name[0] == '_') {
        return 'may not start with "_"';
    }
    if (name[0] == '$') {
        return 'may not start with "$"';
    }
    return null;
};

// copied from mustache lib
exports.is_array = function (a) {
    return Object.prototype.toString.call(a) === '[object Array]';
};

// found on http://stackoverflow.com/questions/1685680/how-to-avoid-scientific-notation-for-large-numbers-in-javascript
exports.toFixed = function (x) {

    if (! x) return x;

    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x;
};

//converts a sort params list to a multisort URL parameter
// @TODO separate "add a new sort field to existing params" and "convert to string"
exports.sortParamsToString = function (sortParams, newSortField, order, newmodi) {

    var multisort = '';
    if (newSortField == undefined) newSortField = false;
    if (order == undefined) order = '';
    if (newmodi == undefined) newmodi = false; // ça ou autre chose... (allows to add _id without modi)

    if (sortParams) {
        var already = false;
        for (var i=0; i < sortParams.length; i++) {
            var es = sortParams[i];
            if (es.field == '_id') {
                continue;
            }
            if (es.field == newSortField) { // invert an existing sort field
                es.order = - es.order;
                already = true;
            }
            // add existing sort field to list
            if (i > 0) {
                multisort += ';';
            }
            multisort += (es.order < 0 ? '-' : '') + es.modi + ':' + es.field;
        }
        if (newSortField) {
            // if clicked field was not already in existing sort
            if (! already) {
                if (multisort != '') {
                    multisort += ';';
                }
                if (newmodi) {
                    multisort += order + newmodi + ':' + newSortField;
                } else {
                    multisort += order + newSortField;
                }
            }
        }
    } else {
        if (newSortField) {
            multisort = order + newmodi + ':' + newSortField; // simple sort
        }
    }

    return multisort;
};

// converts a multisort URL parameter to a sort params list
exports.sortParamsFromString = function (string) {

    var sort_fields = string.split(';');
    var sort_params = [];
    for (var i=0; i < sort_fields.length; i++) {
        // order on multiple fields
        var sf = sort_fields[i],
            order = 1;
        if (sf[0] === '-') {
            sf = sf.slice(1);
            order = -1;
        }
        var modi = null;
        if (sf != '_id') {
            // extract modi
            var parts = sf.split(':');
            modi = parts[0];
            sf = parts[1];
            // test if we have a compound sort key
            if (sf.lastIndexOf('$ref', 0) === 0) {
                sf = sf.split(',');
            }
        }
        sort_params.push({
            field: sf,
            order: order,
            modi: modi
        });
    }

    return sort_params;
};

// returns the normalized value of a widget, depending on the underlying <input class="editw">,
// and the field type (see http://amap-dev.cirad.fr/projects/p2pnote/wiki/Data_format_in_widgets_by_type)
exports.readWidget = function (inputValue, fieldType, defaultValue) {

    // use '' for presets
    if (defaultValue == undefined) {
        defaultValue = null;
    }

    var ret = defaultValue;
    if (inputValue !== '') { // regular value: <input class="editw">'s "value" attribute is not empty ("")
        switch (fieldType) {
            case 'boolean':
                if (inputValue == 'true') {
                    ret = true;
                }
                if (inputValue == 'false') {
                    ret = false;
                }
                break;
            case 'geoloc':
                try {
                    ret = JSON.parse(inputValue);
                } catch(e) {
                    $.log('could not parse geoloc', inputValue);
                }
                break;
            case 'multi-enum':
                ret = inputValue.split(',');
                break;
            case 'integer':
            case 'float':
            case 'range':
                var tmpNum = parseFloat(inputValue);
                if (! isNaN(tmpNum)) {
                    ret = tmpNum;
                }
                break;
            default:
                ret = inputValue;
        }
    }

    return ret;
};

// sets the value "outputValue" in the widget identified by the <input class="editw">
// pointed by "inputEditw", depending on the field type "fieldType"
exports.writeWidget = function (inputEditw, outputValue, fieldType) {

    // 1) feed composite widgets
    switch (fieldType) {
        case 'boolean':
            var radio = inputEditw.parent().find('input.bool-value');
            radio.val([outputValue]);
            break;
        case 'geoloc':
            var lat = 0,
                lng = 0;
            if(outputValue) {
                if (outputValue.length == 2) {
                    lng = value[0];
                    lat = value[1];
                } else {
                    $.log('could not set geoloc', outputValue);
                }
            }
            inputEditw.parent().find('input.lng.loc').val(lng);
            inputEditw.parent().find('input.lat.loc').val(lat);
            inputEditw.parent().find('input.lat.loc').trigger('change');
            break;
        case 'multi-enum':
            inputEditw.parent().find('input.ck').each(function() {
                var ckid = $(this).attr('id').substr(13); // strip "ck-multienum"
                $(this).attr('checked', (outputValue.indexOf(ckid) > -1));
            });
            break;
        default:
    }

    // 2) write "editw" input / feed regular widgets
    if (fieldType == 'geoloc') {
        inputEditw.val(JSON.stringify(outputValue));
    } else {
        inputEditw.val(outputValue);
    }
};

exports.objectEmpty = function(o) {
    for (var p in o) {
        if(o.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
};

/*----------------------------------------------------------------------------------------------------------*/
/* DATE and TIME manipulation */
exports.secondsToString = function(seconds) {
    var daysNum = Math.floor(seconds / 86400),
        hoursNum = Math.floor((seconds % 86400) / 3600),
        minutesNum = Math.floor(((seconds % 86400) % 3600) / 60),
        secondsNum = ((seconds % 86400) % 3600) % 60,
        timeString = '';
    
    timeString = (daysNum ? daysNum + ' days ' : '') +
        (hoursNum ? this.pad(hoursNum) + ' h ' : '') +
        (minutesNum ? this.pad(minutesNum) + ' mn ' : '') +
        (secondsNum ? this.pad(secondsNum) + ' s' : '');
    
    return timeString;
};

// checks if the structure editor is open, and proposes to save or discard the changes
// must be placed in the "before" of all loadable pages
exports.checkOpenStructureEditor = function(app) {
    if (app.data.structureEditorOpen) {
        if (confirm('Some changes in the structure have not been saved. Click "ok" to save structure now, or "cancel" to discard changes.')) {
            var saveStructButton = $('#save-structure-button');
            if (saveStructButton) {
                $.log('clic!');
                saveStructButton.trigger('click');
            }
            return true;
        } else {
            $.log('discard');
            app.data.structureEditorOpen = false;
            return false;
        }
    }
    return false;
}
