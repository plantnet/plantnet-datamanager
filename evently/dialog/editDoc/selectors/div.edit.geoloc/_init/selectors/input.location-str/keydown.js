function(event) { 
    // if enter key on location-str trigger find loc
    var keycode = event.keyCode || event.which,
        continueEdit = false;

    if (keycode == 13) { // keycode for enter key
        $('a.find-loc-cmd', $(this).closest('form')).trigger('click');
        continueEdit = false;
    } else {
        continueEdit = true;
    }
    
    return continueEdit;
};