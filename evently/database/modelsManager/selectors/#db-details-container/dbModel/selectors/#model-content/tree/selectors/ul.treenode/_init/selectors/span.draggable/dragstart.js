function(e) {
    e.originalEvent.dataTransfer.setData('Text', this.id);

    var modi = $(this).attr('data-modi'),
        label = $(this).text().trim(),
        id = $(this).attr('id');

    $(this).addClass("dragged");
    
    $$(this).app.data.dataTransfer = {
        modi: modi,
        label: label,
        id: id,
        src: this
    };
    return true;
}