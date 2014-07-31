function(e) {
    var app = $$(this).app,
        valCk = ($(this).attr('checked') == 'checked'),
        pos = $(this).index('.doc-list input.ck'),
        prevPos = app.lastClickedCheckbox,
        prevState = app.lastClickedCheckboxState;

    if (e.shiftKey && (prevPos >= 0)) {
        if (pos < prevPos) {
            var tmp = prevPos;
            prevPos = pos;
            pos = tmp;
        }
        $('.doc-list input.ck').each(function() {
            var idx = $(this).index('.doc-list input.ck');
            if (idx <= pos && idx >= prevPos) {
                $(this).attr('checked', prevState);
            }
        });
    }

    app.lastClickedCheckbox = pos;
    app.lastClickedCheckboxState = valCk;
}