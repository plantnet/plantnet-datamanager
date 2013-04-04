function(e, parentId, showSynonyms) {
    e.stopPropagation();
    var app = $$(this).app,
        treeViewLib = app.getlib('treeview'),
        showSynonyms = ($('button.include-synonyms-cmd').hasClass('active')),
        treeStructure = app.data.tree,
        that = this;

    treeViewLib.expand_node(app.db, treeStructure, parentId, 
      function() { 
          $(that).trigger('_init'); 
      }, null, showSynonyms);
}