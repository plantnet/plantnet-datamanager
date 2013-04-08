function(e) {
    var showImages = (! $(this).hasClass('active'));

    var action = e.data.args[2],
        id = e.data.args[3],
        skip = e.data.args[5],
        label = e.data.args[0];

    $.pathbinder.go('/viewlist/' + action + '/' + id + '/' + skip +'/' + label + '/' + showImages);
}