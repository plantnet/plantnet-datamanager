function(e) {
    var commonData = e.data.args[0];

    //$.log('CDAS', commonData.available.structures);

    return {
        structures: commonData.available.structures
    };
}