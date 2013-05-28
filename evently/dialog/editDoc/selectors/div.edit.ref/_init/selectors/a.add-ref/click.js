function (e, a, b, c) {
    var mm = e.data.args[2];

    alert("this function is not yet implemented");
    return false;

    var app = $$(this).app,
    utilsLib = app.getlib('utils'),
    mm_id = mm._id;
    
    var newParam = {
        mm_id: mm_id,
    };
    
    $('#dialog-bloc').trigger('editDoc', [undefined, newParam]);
    
    return false;
}