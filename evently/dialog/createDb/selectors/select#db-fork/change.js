function () {
    var v = $(this).val();

    if (v == "url") {
        $("#db-fork-url").show("fast").val("");
    } else {
        $("#db-fork-url").hide("fast").val(v);
    }
}