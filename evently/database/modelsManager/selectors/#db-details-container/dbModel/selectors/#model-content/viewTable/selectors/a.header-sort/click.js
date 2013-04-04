function(e) {
    var a = $(this),
        id = a.attr('data-id'), // .data(...) does automatic type conversion, which is bad
        modi = a.attr('data-modi'),
        corder = a.attr('data-corder'),
        encfield = a.attr('data-encfield'),
        limit = a.attr('data-limit'),
        filter_id = a.attr('data-filter-id'),
        group = a.attr('data-group'),
        showImages = a.attr('data-showimages'),
        multisort = '',
        isView = (e.data.args[13].$type == 'view'); // cracra

    //$.log('id', id, 'modi', modi, 'corder', corder, 'encfield', encfield, 'limit', limit, 'filter_id', filter_id);

    if ((! e.shiftKey) || isView) { // if isView, may sort on one column only
        multisort += corder + modi + ':' + encfield;
    } else {
        var existing_sort = e.data.args[9]; // cracra
        multisort = $$(this).app.libs.utils.sortParamsToString(existing_sort, encfield, corder, modi);
    }

    // always sort by _id after other fields
    multisort += ';_id';

    $.pathbinder.go('/viewtable/' + id + '/' + modi + '/' + multisort +'/' + limit + '/0/' + filter_id + '/' + group + '/' + showImages);
}