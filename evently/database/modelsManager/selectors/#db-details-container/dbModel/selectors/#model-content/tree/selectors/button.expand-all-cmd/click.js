function(e) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        treeViewLib = app.getlib('treeview'),
        treeStructure = app.data.tree,
        showSynonyms = ($('button.include-synonyms-cmd').hasClass('active'));

    utilsLib.showBusyMsg('Retrieving tree data...', 'viewTree');
    treeViewLib.expand_all(app.db, treeStructure, onSuccess, onError, showSynonyms);

    function onError(msg) {
        utilsLib.hideBusyMsg('viewTree');
        utilsLib.showError(msg);
    }

    function onSuccess() {
        utilsLib.hideBusyMsg('viewTree');
        $('ul#root').trigger('_init'); 
    }

    return false;
}