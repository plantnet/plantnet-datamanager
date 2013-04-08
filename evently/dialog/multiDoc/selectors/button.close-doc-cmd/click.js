function() {
    $(this).closest('div.doc-column').remove();
    
    var width = parseInt($('#compare-container').css('width'));
    width = width - 320;
    $('#compare-container').attr('style', 'width:' + width + 'px');
    
    return false;
}