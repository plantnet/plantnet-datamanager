function(data) {
    var btnActivated = $(this).hasClass('active');
    return {
        has_selections: !!data, 
        selections: data,
        active: btnActivated
    };
}