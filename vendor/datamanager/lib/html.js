/*----------------------------------------------------------------------------------------------------------*/
// HTML INTERACTION
exports.indent = function() {
    $('[data-indent]').each(function() {
        var multiplicator = parseInt($(this).attr('data-indent')),
            nbPix = multiplicator * 10;
        
        $(this).css('margin-left', nbPix + 'px');
    });
    return exports;
}

// scroll to element - move this to a better place ?
exports.scrollToTop = function() {
    $(selector).animate({scrollTop: 0}, 'fast');
    return exports;
}

//scroll to element - move this to a better place ?
exports.scrollTo = function(selector, offset) {
    if (! offset) {
        offset = 0;
    }
    $('html, body').animate({ scrollTop: ($(selector).offset().top - (45 + offset)) }, 'fast');
    return exports;
}

//scroll to element - move this to a better place ?
exports.activateImgViewer = function(selector) {
    $(selector).colorbox({
        rel: 'preview',
        maxWidth: '70%',
        scalePhotos: true,
        innerWidth: '700',
        onComplete: function() {
            // automatic EXIF orientation
            var photo = $('img.cboxPhoto');
            photo.imagesLoaded(function () {
                photo.exifLoad(function(d) {
                    var or = photo.exif('Orientation');
                    if (or[0]) {
                        var tf = exports.getExifTransform(or[0]);
                        var w = photo.width(),
                            h = photo.height(),
                            ar = [5, 6, 7, 8],
                            options = {};
                        if (ar.indexOf(or[0]) > -1) { // if width and height are exchanged by the transformation
                            if (h > w) { // if width is about to be increased
                                options.innerWidth = h;
                            }
                            if (h < w) { // if height is about to be increased
                                options.innerHeight = w;
                                // compute translation towards south, because css rotation seems to move image center
                                var translation = ((w / 2) - (h / 2));
                                // if rotation is 270° instead of 90°, translation must be negative
                                if (ar.indexOf(or[0]) > 1) { // orientation 7 or 8
                                    translation = - translation;
                                }
                                tf += ' translate(' + translation + 'px)';
                            }
                            //$.log('resizing to ', options.innerWidth, options.innerHeight);
                            $.colorbox.resize(options);
                        }
                        photo.css('transform', tf);
                        photo.css('-webkit-transform', tf);
                    }
                });
            });
        },
        title: function() {
            // get the "title" attribute of the image and not the one of the link,
            // because bootstrap's tooltip messes with it
            return '<div class="cBoxImageCaption">' + $(this).find('img').attr('title') + "</div>";
        }
    });
    return exports;
}

//returns CSS3 transformation(s) needed to correctly display an image, based
//on its EXIF Orientation tag (integer between 1 and 8)
exports.getExifTransform = function (exifOrientation) {
    var ret = '';
    switch (exifOrientation) {
        case 2:
            ret = 'scale(-1,1)';
            break;
        case 3:
            ret = 'rotate(180deg)';
            break;
        case 4:
            ret = 'scale(1,-1)';
            break;
        case 5:
            ret = 'rotate(90deg) scale(1,-1)';
            break;
        case 6:
            ret = 'rotate(90deg)';
            break;
        case 7:
            ret = 'rotate(270deg) scale(1,-1)';
            break;
        case 8:
            ret = 'rotate(270deg)';
            break;
        case 1:
        default:
            // nothing to transform
    }
    return ret;
}

exports.getAnchor = function(id) {
    return id
        .replace(/#/g, '')
        .replace(/:/g, '')
        .replace(/ /g, '')
        .replace(/\./g, '')
        .replace(/&/g, '')
        .replace(/\(/g, '')
        .replace(/\)/g, '');
}