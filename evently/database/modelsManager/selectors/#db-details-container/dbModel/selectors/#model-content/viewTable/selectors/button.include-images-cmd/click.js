function (e) {

    var showImages = (! $(this).hasClass('active'));

    var id = e.data.args[0],
        modi = e.data.args[4],
        skip = e.data.args[6],
        limit = e.data.args[7],
        multisort = $$(this).app.libs.utils.sortParamsToString(e.data.args[9], '_id'),
        group = e.data.args[14],
        showSyn = e.data.args[16],
        filter_id = '0';

    if (e.data.args[11]) { // filter
        filter_id = e.data.args[11]._id;
    }

    // id is an mm id ?
    if (id.substr(0,8) == '_design/') {
        id = id.slice(8);
    }

    $.pathbinder.go('/viewtable/' + id + '/' + modi + '/' + multisort +'/' + limit + '/' + skip + '/' + filter_id + '/' + group + '/' + showImages + '/' + showSyn);
}