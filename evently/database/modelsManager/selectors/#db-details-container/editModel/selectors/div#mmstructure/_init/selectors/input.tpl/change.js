function () {
    var app = $$(this).app,
        mm = app.data.mm,
        modi = $(this).closest('tr').attr('data-modi');

    mm.structure[modi][4] = $(this).val(); 
}