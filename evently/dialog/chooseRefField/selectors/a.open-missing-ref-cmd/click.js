function() {
    $('#choose-dictionary-modal').modal('hide');
    
    var pathToGo = $(this).attr('href').slice(1);
    $.pathbinder.go(pathToGo);
}