function(e, parentId, showSynonyms) {
    e.stopPropagation();
    var app = $$(this).app,
        treeViewLib = app.getlib('treeview'),
        treeStructure = app.data.tree,
        that = this;

   showSynonyms = ($('button.include-synonyms-cmd').hasClass('active'));


    treeViewLib.expand_node(app.db, treeStructure, parentId, 
      function() { 
          $(that).trigger('_init'); 
      }, null, showSynonyms);
}