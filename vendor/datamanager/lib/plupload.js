
/**
* plupload.html5.js
*
* Copyright 2009, Moxiecode Systems AB
* Released under GPL License.
*
* License: http://www.plupload.com/license
* Contributing: http://www.plupload.com/contributing
*/

// JSLint defined globals
/*global plupload:false, File:false, window:false, atob:false, FormData:false, FileReader:false, ArrayBuffer:false, Uint8Array:false, BlobBuilder:false, unescape:false */

var undef;

function readFileAsDataURL(file, callback) {
    var reader;

    // Use FileReader if it's available
    if ("FileReader" in window) {
        reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            callback(reader.result);
        };
    } else {
        return callback(file.getAsDataURL());
    }
}

function readFileAsBinary(file, callback) {
    var reader;

    // Use FileReader if it's available
    if ("FileReader" in window) {
        reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function() {
            callback(reader.result);
        };
    } else {
        return callback(file.getAsBinary());
    }
}

// return an arraybuffer ready to be uploaded
exports.scaleImage = function(file, max_size, mime, canvas, callback) {
    var context, img, scale,
    up = this;

    readFileAsDataURL(file, function(data) {
        // Setup canvas and context
        //canvas = window.document.createElement("canvas");
        //canvas.style.display = 'none';
        //window.document.body.appendChild(canvas);
        context = canvas.getContext('2d');

        // Load image
        img = new Image();
        img.onerror = img.onabort = function() {
            // Failed to load, the image may be invalid
            callback();
        };
        img.onload = function() {
            var width, height, percentage, jpegHeaders, exifParser;

            var max_img = Math.max(img.height, img.width);
            var scale = max_size / max_img;
                         
            if (scale < 1 || (scale === 1 && mime === 'image/jpeg')) {
                width = Math.round(img.width * scale);
                height = Math.round(img.height * scale);

                // Scale image and canvas
                canvas.width = width;
                canvas.height = height;
                context.drawImage(img, 0, 0, width, height);

                // Preserve JPEG headers
                if (mime === 'image/jpeg') {
                    jpegHeaders = new JPEG_Headers(atob(data.substring(data.indexOf('base64,') + 7)));
                    if (jpegHeaders['headers'] && jpegHeaders['headers'].length) {
                        exifParser = new ExifParser();			

                        if (exifParser.init(jpegHeaders.get('exif')[0])) {
                            // Set new width and height
                            exifParser.setExif('PixelXDimension', width);
                            exifParser.setExif('PixelYDimension', height);

                            // Update EXIF header
                            jpegHeaders.set('exif', exifParser.getBinary());
                            
                        }
                    }

                     
                } 
                
                data = canvas.toDataURL(mime);
                
                // Remove data prefix information and grab the base64 encoded data and decode it
                data = data.substring(data.indexOf('base64,') + 7);
                data = atob(data);

                // Restore JPEG headers if applicable
                if (jpegHeaders && jpegHeaders['headers'] && jpegHeaders['headers'].length) {
                    data = jpegHeaders.restore(data);
                    jpegHeaders.purge(); // free memory
                }
               
                       
                // write the bytes of the string to an ArrayBuffer
                var ab = new ArrayBuffer(data.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < data.length; i++) {
                    ia[i] = data.charCodeAt(i) & 0xff;
                }
                
                // Remove canvas and execute callback with decoded image data
                // canvas.parentNode.removeChild(canvas);
                callback(ia);
                
            } else {
                // Image does not need to be resized
                callback(dataURItoArrayBuffer(data));
            }
        };

        img.src = data;
    });
}

function BinaryReader() {
    var II = false, bin;

    // Private functions
    function read(idx, size) {
        var mv = II ? 0 : -8 * (size - 1), sum = 0, i;

        for (i = 0; i < size; i++) {
            sum |= (bin.charCodeAt(idx + i) << Math.abs(mv + i*8));
        }

        return sum;
    }

    function putstr(segment, idx, length) {
        var length = arguments.length === 3 ? length : bin.length - idx - 1;

        bin = bin.substr(0, idx) + segment + bin.substr(length + idx);
    }

    function write(idx, num, size) {
        var str = '', mv = II ? 0 : -8 * (size - 1), i;

        for (i = 0; i < size; i++) {
            str += String.fromCharCode((num >> Math.abs(mv + i*8)) & 255);
        }

        putstr(str, idx, size);
    }

    // Public functions
    return {
        II: function(order) {
            if (order === undef) {
                return II;
            } else {
                II = order;
            }
        },

        init: function(binData) {
            II = false;
            bin = binData;
        },

        SEGMENT: function(idx, length, segment) {				
            switch (arguments.length) {
                case 1: 
                return bin.substr(idx, bin.length - idx - 1);
                case 2: 
                return bin.substr(idx, length);
                case 3: 
                putstr(segment, idx, length);
                break;
                default: return bin;	
            }
        },

        BYTE: function(idx) {
            return read(idx, 1);
        },

        SHORT: function(idx) {
            return read(idx, 2);
        },

        LONG: function(idx, num) {
            if (num === undef) {
                return read(idx, 4);
            } else {
                write(idx, num, 4);
            }
        },

        SLONG: function(idx) { // 2's complement notation
            var num = read(idx, 4);

            return (num > 2147483647 ? num - 4294967296 : num);
        },

        STRING: function(idx, size) {
            var str = '';

            for (size += idx; idx < size; idx++) {
                str += String.fromCharCode(read(idx, 1));
            }

            return str;
        }
    };
}



function JPEG_Headers(data) {

    var markers = {
        0xFFE1: {
            app: 'EXIF',
            name: 'APP1',
            signature: "Exif\0" 
        },
        0xFFE2: {
            app: 'ICC',
            name: 'APP2',
            signature: "ICC_PROFILE\0" 
        },
        0xFFED: {
            app: 'IPTC',
            name: 'APP13',
            signature: "Photoshop 3.0\0" 
        }
    },
    headers = [], read, idx, marker = undef, length = 0, limit;


    read = new BinaryReader();
    read.init(data);

    // Check if data is jpeg
    if (read.SHORT(0) !== 0xFFD8) {
        return;
    }

    idx = 2;
    limit = Math.min(1048576, data.length);	

    while (idx <= limit) {
        marker = read.SHORT(idx);

        // omit RST (restart) markers
        if (marker >= 0xFFD0 && marker <= 0xFFD7) {
            idx += 2;
            continue;
        }

        // no headers allowed after SOS marker
        if (marker === 0xFFDA || marker === 0xFFD9) {
            break;	
        }	

        length = read.SHORT(idx + 2) + 2;	

        if (markers[marker] && 
            read.STRING(idx + 4, markers[marker].signature.length) === markers[marker].signature) {
                headers.push({ 
                    hex: marker,
                    app: markers[marker].app.toUpperCase(),
                    name: markers[marker].name.toUpperCase(),
                    start: idx,
                    length: length,
                    segment: read.SEGMENT(idx, length)
                });
            }
            idx += length;			
        }

        read.init(null); // free memory

        return {

            headers: headers,

            restore: function(data) {
                read.init(data);

                // Check if data is jpeg
                var jpegHeaders = new JPEG_Headers(data);

                if (!jpegHeaders['headers']) {
                    return false;
                }	

                // Delete any existing headers that need to be replaced
                for (var i = jpegHeaders['headers'].length; i > 0; i--) {
                    var hdr = jpegHeaders['headers'][i - 1];
                    read.SEGMENT(hdr.start, hdr.length, '')
                }
                jpegHeaders.purge();

                idx = read.SHORT(2) == 0xFFE0 ? 4 + read.SHORT(4) : 2;

                for (var i = 0, max = headers.length; i < max; i++) {
                    read.SEGMENT(idx, 0, headers[i].segment);						
                    idx += headers[i].length;
                }

                return read.SEGMENT();
            },

            get: function(app) {
                var array = [];

                for (var i = 0, max = headers.length; i < max; i++) {
                    if (headers[i].app === app.toUpperCase()) {
                        array.push(headers[i].segment);
                    }
                }
                return array;
            },

            set: function(app, segment) {
                var array = [];

                if (typeof(segment) === 'string') {
                    array.push(segment);	
                } else {
                    array = segment;	
                }

                for (var i = ii = 0, max = headers.length; i < max; i++) {
                    if (headers[i].app === app.toUpperCase()) {
                        headers[i].segment = array[ii];
                        headers[i].length = array[ii].length;
                        ii++;
                    }
                    if (ii >= array.length) break;
                }
            },

            purge: function() {
                headers = [];
                read.init(null);
            }
        };		
    }


    function ExifParser() {
        // Private ExifParser fields
        var data, tags, offsets = {}, tagDescs;

        data = new BinaryReader();

        tags = {
            tiff : {
                /*
                The image orientation viewed in terms of rows and columns.

1 - The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
2 - The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
3 - The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
4 - The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
5 - The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
6 - The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
7 - The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
8 - The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
9 - The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
*/
0x0112: 'Orientation',
0x8769: 'ExifIFDPointer',
0x8825:	'GPSInfoIFDPointer'
},
exif : {
    0x9000: 'ExifVersion',
    0xA001: 'ColorSpace',
    0xA002: 'PixelXDimension',
    0xA003: 'PixelYDimension',
    0x9003: 'DateTimeOriginal',
    0x829A: 'ExposureTime',
    0x829D: 'FNumber',
    0x8827: 'ISOSpeedRatings',
    0x9201: 'ShutterSpeedValue',
    0x9202: 'ApertureValue'	,
    0x9207: 'MeteringMode',
    0x9208: 'LightSource',
    0x9209: 'Flash',
    0xA402: 'ExposureMode',
    0xA403: 'WhiteBalance',
    0xA406: 'SceneCaptureType',
    0xA404: 'DigitalZoomRatio',
    0xA408: 'Contrast',
    0xA409: 'Saturation',
    0xA40A: 'Sharpness'
},
gps : {
    0x0000: 'GPSVersionID',
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude'
}
};

tagDescs = {
    'ColorSpace': {
        1: 'sRGB',
        0: 'Uncalibrated'
    },

    'MeteringMode': {
        0: 'Unknown',
        1: 'Average',
        2: 'CenterWeightedAverage',
        3: 'Spot',
        4: 'MultiSpot',
        5: 'Pattern',
        6: 'Partial',
        255: 'Other'
    },

    'LightSource': {
        1: 'Daylight',
        2: 'Fliorescent',
        3: 'Tungsten',
        4: 'Flash',
        9: 'Fine weather',
        10: 'Cloudy weather',
        11: 'Shade',
        12: 'Daylight fluorescent (D 5700 - 7100K)',
        13: 'Day white fluorescent (N 4600 -5400K)',
        14: 'Cool white fluorescent (W 3900 - 4500K)',
        15: 'White fluorescent (WW 3200 - 3700K)',
        17: 'Standard light A',
        18: 'Standard light B',
        19: 'Standard light C',
        20: 'D55',
        21: 'D65',
        22: 'D75',
        23: 'D50',
        24: 'ISO studio tungsten',
        255: 'Other'
    },

    'Flash': {
        0x0000: 'Flash did not fire.',
        0x0001: 'Flash fired.',
        0x0005: 'Strobe return light not detected.',
        0x0007: 'Strobe return light detected.',
        0x0009: 'Flash fired, compulsory flash mode',
        0x000D: 'Flash fired, compulsory flash mode, return light not detected',
        0x000F: 'Flash fired, compulsory flash mode, return light detected',
        0x0010: 'Flash did not fire, compulsory flash mode',
        0x0018: 'Flash did not fire, auto mode',
        0x0019: 'Flash fired, auto mode',
        0x001D: 'Flash fired, auto mode, return light not detected',
        0x001F: 'Flash fired, auto mode, return light detected',
        0x0020: 'No flash function',
        0x0041: 'Flash fired, red-eye reduction mode',
        0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
        0x0047: 'Flash fired, red-eye reduction mode, return light detected',
        0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
        0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
        0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
        0x0059: 'Flash fired, auto mode, red-eye reduction mode',
        0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
        0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
    },

    'ExposureMode': {
        0: 'Auto exposure',
        1: 'Manual exposure',
        2: 'Auto bracket'
    },

    'WhiteBalance': {
        0: 'Auto white balance',
        1: 'Manual white balance'
    },

    'SceneCaptureType': {
        0: 'Standard',
        1: 'Landscape',
        2: 'Portrait',
        3: 'Night scene'
    },

    'Contrast': {
        0: 'Normal',
        1: 'Soft',
        2: 'Hard'
    },

    'Saturation': {
        0: 'Normal',
        1: 'Low saturation',
        2: 'High saturation'
    },

    'Sharpness': {
        0: 'Normal',
        1: 'Soft',
        2: 'Hard'
    },

    // GPS related
    'GPSLatitudeRef': {
        N: 'North latitude',
        S: 'South latitude'
    },

    'GPSLongitudeRef': {
        E: 'East longitude',
        W: 'West longitude'
    }
};

function extractTags(IFD_offset, tags2extract) {
    var length = data.SHORT(IFD_offset), i, ii,
    tag, type, count, tagOffset, offset, value, values = [], hash = {};

    for (i = 0; i < length; i++) {
        // Set binary reader pointer to beginning of the next tag
        offset = tagOffset = IFD_offset + 12 * i + 2;

        tag = tags2extract[data.SHORT(offset)];

        if (tag === undef) {
            continue; // Not the tag we requested
        }

        type = data.SHORT(offset+=2);
        count = data.LONG(offset+=2);

        offset += 4;
        values = [];

        switch (type) {
            case 1: // BYTE
            case 7: // UNDEFINED
            if (count > 4) {
                offset = data.LONG(offset) + offsets.tiffHeader;
            }

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.BYTE(offset + ii);
            }

            break;

            case 2: // STRING
            if (count > 4) {
                offset = data.LONG(offset) + offsets.tiffHeader;
            }

            hash[tag] = data.STRING(offset, count - 1);

            continue;

            case 3: // SHORT
            if (count > 2) {
                offset = data.LONG(offset) + offsets.tiffHeader;
            }

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.SHORT(offset + ii*2);
            }

            break;

            case 4: // LONG
            if (count > 1) {
                offset = data.LONG(offset) + offsets.tiffHeader;
            }

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.LONG(offset + ii*4);
            }

            break;

            case 5: // RATIONAL
            offset = data.LONG(offset) + offsets.tiffHeader;

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.LONG(offset + ii*4) / data.LONG(offset + ii*4 + 4);
            }

            break;

            case 9: // SLONG
            offset = data.LONG(offset) + offsets.tiffHeader;

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.SLONG(offset + ii*4);
            }

            break;

            case 10: // SRATIONAL
            offset = data.LONG(offset) + offsets.tiffHeader;

            for (ii = 0; ii < count; ii++) {
                values[ii] = data.SLONG(offset + ii*4) / data.SLONG(offset + ii*4 + 4);
            }

            break;

            default:
            continue;
        }

        value = (count == 1 ? values[0] : values);

        if (tagDescs.hasOwnProperty(tag) && typeof value != 'object') {
            hash[tag] = tagDescs[tag][value];
        } else {
            hash[tag] = value;
        }
    }

    return hash;
}

function getIFDOffsets() {
    var Tiff = undef, idx = offsets.tiffHeader;

    // Set read order of multi-byte data
    data.II(data.SHORT(idx) == 0x4949);

    // Check if always present bytes are indeed present
    if (data.SHORT(idx+=2) !== 0x002A) {
        return false;
    }

    offsets['IFD0'] = offsets.tiffHeader + data.LONG(idx += 2);
    Tiff = extractTags(offsets['IFD0'], tags.tiff);

    offsets['exifIFD'] = ('ExifIFDPointer' in Tiff ? offsets.tiffHeader + Tiff.ExifIFDPointer : undef);
    offsets['gpsIFD'] = ('GPSInfoIFDPointer' in Tiff ? offsets.tiffHeader + Tiff.GPSInfoIFDPointer : undef);

    return true;
}

// At the moment only setting of simple (LONG) values, that do not require offset recalculation, is supported
function setTag(ifd, tag, value) {
    var offset, length, tagOffset, valueOffset = 0;

    // If tag name passed translate into hex key
    if (typeof(tag) === 'string') {
        var tmpTags = tags[ifd.toLowerCase()];
        for (hex in tmpTags) {
            if (tmpTags[hex] === tag) {
                tag = hex;
                break;	
            }
        }
    }
    offset = offsets[ifd.toLowerCase() + 'IFD'];
    length = data.SHORT(offset);

    for (i = 0; i < length; i++) {
        tagOffset = offset + 12 * i + 2;

        if (data.SHORT(tagOffset) == tag) {
            valueOffset = tagOffset + 8;
            break;
        }
    }

    if (!valueOffset) return false;


    data.LONG(valueOffset, value);
    return true;
}


// Public functions
return {
    init: function(segment) {
        // Reset internal data
        offsets = {
            tiffHeader: 10
        };

        if (segment === undef || !segment.length) {
            return false;
        }

        data.init(segment);

        // Check if that's APP1 and that it has EXIF
        if (data.SHORT(0) === 0xFFE1 && data.STRING(4, 5).toUpperCase() === "EXIF\0") {
            return getIFDOffsets();
        }
        return false;
    },

    EXIF: function() {
        var Exif;

        // Populate EXIF hash
        Exif = extractTags(offsets.exifIFD, tags.exif);

        // Fix formatting of some tags
        if (Exif.ExifVersion && plupload.typeOf(Exif.ExifVersion) === 'array') {
            for (var i = 0, exifVersion = ''; i < Exif.ExifVersion.length; i++) {
                exifVersion += String.fromCharCode(Exif.ExifVersion[i]);	
            }
            Exif.ExifVersion = exifVersion;
        }

        return Exif;
    },

    GPS: function() {
        var GPS;

        GPS = extractTags(offsets.gpsIFD, tags.gps);

        // iOS devices (and probably some others) do not put in GPSVersionID tag (why?..)
        if (GPS.GPSVersionID) { 
            GPS.GPSVersionID = GPS.GPSVersionID.join('.');
        }

        return GPS;
    },

    setExif: function(tag, value) {
        // Right now only setting of width/height is possible
        if (tag !== 'PixelXDimension' && tag !== 'PixelYDimension') return false;

        return setTag('exif', tag, value);
    },


    getBinary: function() {
        return data.SEGMENT();
    }
};
};


// from http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
function dataURItoArrayBuffer(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    //var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i) & 0xff;
    }

    return ab;
};