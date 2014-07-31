function() {
    var app = $$(this).app,
        ul = $(this).closest("ul.menu"),
        doc_id = ul.attr("docid-data"),
        parent_modi = ul.data("parentmodi");

    var new_param = {
        parent: doc_id,
        parent_modi: parent_modi,
        mm_id: ul.attr("mmid-data"),
        modi: $(this).attr("href").slice(1)
    };

    var trigger = new app.libs.utils.Trigger(
        $("#main-bloc"), "viewDoc", [{ id : doc_id }], false);

    $("#dialog-bloc").trigger("editDoc", [undefined, new_param, trigger]);
    return false;
}