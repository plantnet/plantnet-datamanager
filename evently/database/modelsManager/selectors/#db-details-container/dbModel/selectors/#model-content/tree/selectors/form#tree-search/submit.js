function(e) {
    e.preventDefault();
    var filterValue = $('input[name="q"]', this).val(),
        mm_id = $(this).data("mm").slice("8");

    var showSyn = ($('button.include-synonyms-cmd').hasClass('active'));
    $.pathbinder.go("/tree/" + mm_id + "/" + filterValue + "/" + (showSyn ? "1" : "0"));

    return false;
}