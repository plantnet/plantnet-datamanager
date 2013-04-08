function (e) {
    var query = e.data.args[1],
    mm = e.data.args[2];
    $('div#criteria').trigger('save',[query]).trigger('_init', [query, mm]);
}