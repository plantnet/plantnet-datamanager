function () {
    $(".indent").each(
        function() {
            var nbpix = parseInt($(this).attr("data-indent"));
            nbpix *= 20;
            //$(this).css("margin-left", nbpix + "px");
            $('<span class="indent-mark display-inline-block" style="width: ' + nbpix + 'px;">&nbsp;</span>').insertBefore($(this));
        });
}