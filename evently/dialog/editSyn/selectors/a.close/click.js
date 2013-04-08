function () {

    var app = $$(this).app;

    $(this).trigger("doClose");

    if (app.data.trigger) { // reload node on close
        app.data.trigger.trigger();
    }

    return false;
}