function(event) {
    $(this).trigger("uploadFiles", [event.target.files]);
    return false;
}