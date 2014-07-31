function(e) {
    var app = $$(this).app,
        origin = e.data.args[2],
        textarea = $('form#edit-enum').find('textarea'),
        originInput = origin.parent().find('input');

    var vals = textarea.val();
    vals = vals.split('\n');

    vals = vals.sort();
    vals = vals.unique();
    vals = vals.join('\n');

    textarea.val(vals);

    return false;
}