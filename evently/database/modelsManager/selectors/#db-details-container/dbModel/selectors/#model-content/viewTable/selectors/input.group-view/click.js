function (e) {
    // changes the view grouping option and reloads the view
    // @TODO reload only if the checked option has changed
    var group = ($(this).val() === 'true'),
        id = e.data.args[0],
        modi = e.data.args[4],
        limit = e.data.args[7],
        showImages = e.data.args[15],
        showSyn = e.data.args[16],
        multisort = $$(this).app.libs.utils.sortParamsToString(e.data.args[9], '_id'),
        filter_id = '0';

    if (e.data.args[11]) { // filter
        filter_id = e.data.args[11]._id;
    }

    $.pathbinder.go('/viewtable/' + id + '/' + modi + '/' + multisort +'/' + limit + '/0/' + filter_id + '/' + group + '/' + showImages + '/' + showSyn);
}