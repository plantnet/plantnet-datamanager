function() {
    var app = $$(this).app;
    app.libs.utils.hideBusyMsg('showQSQueries');
    $('#quicksearch-queries-modal').modal('show');
}