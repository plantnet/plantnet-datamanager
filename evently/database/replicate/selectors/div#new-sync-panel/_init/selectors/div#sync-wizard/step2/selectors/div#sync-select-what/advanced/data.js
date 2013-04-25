function(e) {
    var app = $$(this).app,
        commonData = e.data.args[0];

    //$.log(commonData.available.structures);

    return {
        structures: commonData.available.structures
    };
}