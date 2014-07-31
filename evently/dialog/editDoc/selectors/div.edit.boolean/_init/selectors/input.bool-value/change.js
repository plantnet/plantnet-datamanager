function(){
    var value = $(this).attr('value');
    //$.log('Value :', value);
    $(this).parent().find('input.editw').val(value);
    //$.log('Value editW :', $(this).parents().find('input.editw').val());
};