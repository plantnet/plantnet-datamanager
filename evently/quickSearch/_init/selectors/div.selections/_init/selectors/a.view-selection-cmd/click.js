function() {
    $(this).parents('ul.selections').find('li').removeClass('active');
    $(this).parent('li').addClass('active');
    
    // Don't return false or use event.stopPropagation() if you want see the dropdown closed
}