var PlUpload = require('vendor/datamanager/lib/plupload'),
max_size = 800;

exports.upload_files = function (db, _id, _rev, files, cb) {
    // Loop through the FileList and sort on type
    var img_files = [], 
        bin_files = [];
    for (var i = 0, f; f = files[i]; i++) {
        if (f.type.match('image.*')) {
            img_files.push(f);
        } else {
            bin_files.push(f);
        }
    }
    
    var canvas = document.createElement('canvas');
        canvas.style.display = 'none';    

    function processImg(file, next) {
        if (!file.type.match('image.*')) {
            // if not image store file directly
            next();
            return;
        }      
        
        function upl(data) {
            if (!data) {
                alert("no image data");
                return;
            }
            _upload_file(db, _id, _rev, 
                {
                    name: file.name, 
                    type: file.type,
                    data: data
                }, 
                function (ret) {
                    if (ret.ok) {
                        _rev = ret.rev;
                    }
                    next();
                    // refresh here ?
                },
                function (jqXHR, textStatus, errorThrown) {
                    alert("cannot upload : " + textStatus + errorThrown);
                    next();
                });
        }
        
        PlUpload.scaleImage(file, max_size, /\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg', canvas, upl);     
    }

    // process image files and then other binary files
    img_files.asyncForEach(processImg, function() {
        if (bin_files.length) {
            _upload_bin_files(db, _id, _rev, bin_files, cb, alert);
        } else {
            cb();
        }
    });
}




exports.get_local_file = function (fn, onSuccess, onError) {

    function store_file (xhr) {
        var type = xhr.getResponseHeader("Content-Type");
        onSuccess({name : fn, type : type, data : xhr.mozResponseArrayBuffer || xhr.response});
    }


    var xhr = new XMLHttpRequest();
    // get thumbnail from local server as an arraybuffer
    xhr.open('GET', "http://localhost:5990/" + fn + ".thumb", true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function onload() {
        if (this.status != 200)  {
            onError('Cannot find ressource ' + fn);
            return;
        }
        if (ArrayBuffer.prototype.isPrototypeOf(this.response)) {
            store_file(this);
        } else {
            onError("Not an arraybuffer");
        }
    };
    xhr.onerror = function () {
        onError('Cannot find local file \'' + fn + '\'');
    };
    xhr.send();
};


// store a local file in doc _id
exports.store_local_file = function (db, _id, _rev, fn, onSuccess, onError) {

    exports.get_local_file(fn, function (filedata) {
                               exports.upload_file(db, _id, _rev, 
                                                   filedata, onSuccess, onError);
                           }, onError);

};

// upload one file
// file is a n object {name : name, type : type, data : dataurl} object
// call onSuccess({status : ok, rev : new_rev});
var _upload_file = function (db, _id, _rev, file, onSuccess, onError) {
    var url = db.uri + $.couch.encodeDocId(_id) + "/" + file.name
        + "?rev=" + _rev;

    $.ajax({
        url : url,
        contentType : file.type,
        type : "PUT",
        data : file.data.buffer ? file.data.buffer : file.data, // if image is resized, use buffer
        processData: false,
        success : function (data) { 
            if(typeof data == "string") {
                data = JSON.parse(data);
            }
            onSuccess(data);
        },
        error : onError,
        dataType : "JSON"
    });
};

// upload files : a list of file object
var _upload_bin_files = function(db, _id, _rev, files, onSuccess, onError) {
    var url = db.uri + $.couch.encodeDocId(_id);

    var fd = new FormData();
    fd.append("_id", _id);
    fd.append("_rev", _rev);
    for (var i = 0, f; f = files[i]; i++) {
        fd.append("_attachments", f);
    }
    var xhr = new XMLHttpRequest(); 
    
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4) {
            if(xhr.status == 201) { 
                onSuccess();
            } 
            else { 
                onError("Error: returned status code " + 
                        xhr.status + " " + xhr.statusText); 
            } 
        } 
    }; 
    
    xhr.open("POST", url, true);
    xhr.send(fd);
};


/* from http://jsperf.com/encoding-xhr-image-data/5 */
exports.arrayBufferTobase64 = function (raw) {
   var base64 = '',
   encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
   bytes = new Uint8Array(raw),
   byteLength = bytes.byteLength,
   byteRemainder = byteLength % 3,
   mainLength = byteLength - byteRemainder;
  
   var a, b, c, d, chunk;
    
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63; // 63       = 2^6 - 1
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }
    
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];
        
        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1
        base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        
        a = (chunk & 16128) >> 8; // 16128 = (2^6 - 1) << 8
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
  
   return base64;
};

