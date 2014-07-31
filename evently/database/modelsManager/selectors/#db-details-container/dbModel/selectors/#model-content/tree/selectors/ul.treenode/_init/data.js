function(e) {
    var treeStructure = $$(this).app.data.tree;
    
    modifyTreeStructure({sons : [treeStructure]});
    
    function modifyTreeStructure(s) {
        for (var i = 0, l = s.sons.length; i < l; i++) {
            var obj = s.sons[i];
            
            if (!obj.count || obj.count === 0) {
                obj['is_empty'] = true;
            } else if(obj.sons.length !== obj.count) {
                obj['is_empty'] = false;
                obj['is_opened'] = false;
                obj['is_closed'] = true;
            } else {
                obj['is_empty'] = false;
                obj['is_opened'] = true;
                obj['is_closed'] = false;
            }
            
            if (treeStructure.selected_nodes[obj._id]) {
                obj['selected'] = 'selected';
            } else {
                obj.selected = '';
            }
            modifyTreeStructure(obj);
        }
    }
    
    return {node: treeStructure}; 
}