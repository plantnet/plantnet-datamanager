function (e) {
    var answer = confirm ("Change valid name ?");
    if(!answer) {
        var activeid = e.data.args[0];
        $("input[id="+activeid+"]").attr("checked", true);
        return false;
    }

    $("form#active-syn").trigger("submit");
}