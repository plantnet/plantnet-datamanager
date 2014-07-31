function() { 
    $('.nav-tabs li.active').removeClass('active');
    $('.nav-tabs a[href="#/db-home"]').parent('li').addClass('active');
}