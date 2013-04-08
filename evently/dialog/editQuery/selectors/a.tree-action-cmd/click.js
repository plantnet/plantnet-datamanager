function (e) {
    $(this).next().toggle("fast");
    var span = $(this).find('span.tree-state');
    if(span.html() == '►') {
        span.html('▼');
    } else {
        span.html('►');
    }
    return false;
}