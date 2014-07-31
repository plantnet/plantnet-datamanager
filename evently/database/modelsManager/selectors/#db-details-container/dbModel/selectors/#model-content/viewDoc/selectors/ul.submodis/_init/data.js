function(e, id, mm_id, parent_modi) {
    var app = $$(this).app,
    submodis;
    

    return {
        submodis: app.data.moduleSons[parent_modi],
        id: id,
        mm_id : mm_id
    };
}