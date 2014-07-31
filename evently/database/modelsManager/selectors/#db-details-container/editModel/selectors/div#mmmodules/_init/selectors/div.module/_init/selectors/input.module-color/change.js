function(e) {

    var input = $(this),
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        typedColor =  input.val(),
        previousColor = input.css('border-bottom-color');

    function isColor(color) {
        var re6 = /^#[0-9a-f]{6}$/i,
            re3 = /^#[0-9a-f]{3}$/i;
        return (re6.test(color) || re3.test(color));
    }

    if (! isColor(previousColor)) {
        previousColor = $$(this).app.libs.utils.rgb2hex(previousColor);
    }

    if (isColor(typedColor)) {
        input.css('border-color', typedColor);
    } else {
        input.val(previousColor);
        utilsLib.showError('Bad color');
    }
}