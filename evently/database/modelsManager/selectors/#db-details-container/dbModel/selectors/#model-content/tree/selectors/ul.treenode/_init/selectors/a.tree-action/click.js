function(e) {
    var app = $$(this).app,
        treeStructure = app.data.tree,
        parent_id = $(this).attr('href').slice(1),
        showSynonyms = ($('button.include-synonyms-cmd').hasClass('active'));

    if ($(this).hasClass('close-tree')) {
        treeStructure.by_id[parent_id].sons = [];
        
        var li = $(this).closest('li');
        li.children('ul.treenode').hide('fast').empty();
        
        $('a.close-tree', li).first()
            .removeClass('close-tree').addClass('open-tree')
            .html('&#x25BA;');

    } else if ($(this).hasClass('open-tree')) {
        var treeViewLib = app.getlib('treeview'),
            utilsLib = app.getlib('utils'),
            that = this;
        
        utilsLib.showBusyMsg('Expanding nodes...', 'viewTree');
        
        treeViewLib.expand_node(app.db, treeStructure, parent_id,
           function() {
               $(that).closest('li').find('ul.treenode').trigger('_init');
               utilsLib.hideBusyMsg('viewTree');
           }, 
           function (e, a, b) {
               utilsLib.showError(e + a + b);
           }, 
           showSynonyms);
    }
    return false;
}