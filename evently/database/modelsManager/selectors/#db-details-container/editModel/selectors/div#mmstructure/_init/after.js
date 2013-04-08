function () {
    $(".indent").each(
        function() {
            var nbpix = parseInt($(this).attr("data-indent"));
            nbpix *= 20;
            $(this).css("margin-left", nbpix + "px");
        });
}