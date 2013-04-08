function (query, mm, mms, mmLib) {

    var modi_list = mmLib.get_modi_list_with_fields(mm, mms),
        modt_list = [],
        modts = [];

    var fields,
        field;
    // $.log('modi list', modi_list);
    for (var i=0; i < modi_list.length; i++) {
        var mi = modi_list[i];
        fields = mi.fields;
        if (query.$select == mi.modi) {
            mi.selected = true;
        }
        for (var j=0, m=fields.length; j<m; j++) {
            field = fields[j];
            if (field.refs) {
                field.__has__refs = true;
            }
        }
    }

    for (var modt in mm.modules) {
        modts.push({
            name: mm.modules[modt].name,
            modt: modt,
            selected: query.$select === modt
        });

        modt_list.push(mm.modules[modt]);
        mm.modules[modt].fields = mm.modules[modt].fields.map(
            function(e) {
                e.modt = modt;
                e.mm_ref_id = e.mm;
                return e;
            }
        );
    }

    return {
        _id: query._id,
        query_name: query.name,
        modts: modts,
        modi_list: modi_list,
        modt_list: modt_list
    };
}