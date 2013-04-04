function (e) {
    $(this).removeClass("hover");
    e.preventDefault();
    $(this).trigger("uploadFiles", [e.originalEvent.dataTransfer.files]);
    return false;
}