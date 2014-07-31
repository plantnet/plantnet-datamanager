function(e, id) {

    var tree = $$(this).app.data.tree,
        data,
        submodis = null;

    if (id !== null) {
        data = tree.by_id[id];
        submodis = data ? data.submodis : null;
    }

    return {
        submodis: submodis,
        id: id
    };
}