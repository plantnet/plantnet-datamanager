function (evt, mm) {
    mm = evt.data.args[0];

    var columns = $$(this).app.data.cols,
        data = {};

    if (columns) {
        var mmLib = $$(this).app.getlib('mm'),
            modiList = mmLib.get_modi_list_with_fields(mm);
        var cols = columns.map(function(label) {
           return {
               label: label,
               modules: modiList
           };
        });
        data = {
            cols: cols,
            has_cols: !!cols.length
        };
    }

    return data;
}