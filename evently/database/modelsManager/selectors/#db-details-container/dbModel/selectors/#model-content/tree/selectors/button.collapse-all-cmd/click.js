function() {
    var app = $$(this).app;
    
    app.data.tree.sons = [];
    
    $('ul#root ul.treenode').detach().remove();
    $('ul#root').trigger('_init');
    return false;
}