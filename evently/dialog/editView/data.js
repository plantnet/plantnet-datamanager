function(view, mm, mms, mmLib) {
    var modiList = mmLib.get_modi_list_with_fields(mm, mms);

    var fields,
        field;
    for (var i=0, l=modiList.length; i<l; i++) {
        fields = modiList[i].fields;
        for (var j=0, m=fields.length; j<m; j++) {
            field = fields[j];
            if (field.refs) {
                field.__has__refs = true;
            }
        }
    }

    return {
        _id: view._id,
        name: view.name,
        modules: modiList
    };
}