function () {
    // add new module
    //$('#mmmodules').trigger('save'); // pquoi faire?

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mm = app.data.mm,
        new_id1 = utilsLib.get_uniq_key(mm.modules); 

    mm.modules[new_id1] = {
        name: 'no_name',
        desc: '',
        fields: [],
        order: 1000
    };

    // add an instance by default
    var new_id2 = '.' + new_id1;
    mm.structure[new_id2] = [new_id1, ''];
   
    // refresh 
    $('#mmmodules').trigger('_init', { activateTab: 'last' });
    $('#mmstructure').trigger('_init');

    return false;
};