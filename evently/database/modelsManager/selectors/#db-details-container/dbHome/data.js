function(doc) {
    // Mise en cache
    var app = $$(this).app;

    app.data.wiki = doc;

    var desc = doc.desc ? doc.desc : 'click to edit me',
        comments = doc.comments ? doc.comments : 'click to edit me';

    return {
        desc: desc,
        comments: comments
    };
}