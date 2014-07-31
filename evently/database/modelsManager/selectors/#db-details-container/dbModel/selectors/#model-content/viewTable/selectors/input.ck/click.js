function(e) {
    var app = $$(this).app,
        valCk = ($(this).attr('checked') == 'checked'),
        pos = $(this).index('table.data input.ck'),
        prevPos = app.lastClickedCheckbox,
        prevState = app.lastClickedCheckboxState;

    if (e.shiftKey && (prevPos >= 0)) {
        if (pos < prevPos) {
            var tmp = prevPos;
            prevPos = pos;
            pos = tmp;
        }
        $('table.data input.ck').each(function() {
            var idx = $(this).index('table.data input.ck');
            if (idx <= pos && idx >= prevPos) {
                $(this).attr('checked', prevState);
            }
        });
    }

    app.lastClickedCheckbox = pos;
    app.lastClickedCheckboxState = valCk;
}