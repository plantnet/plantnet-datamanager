function(e) {
    var code = e.keyCode || e.which;
    switch (code) {
        case 27: // ESC
            $('.modal').modal('hide');
        break;
    }
};