function () {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        db =  app.db,
        desc = $('#wiki-desc').html().trim(),
        comments = $('#wiki-comments').html().trim(),
        doc = app.data.wiki,
        docDiff = false;
    
    if (doc.desc != desc) {
        doc.desc = desc;
        docDiff = true;
    }
    if (doc.comments != comments) {
        doc.comments = comments;
        docDiff = true;
    }
    if (docDiff) {
        db.saveDoc(doc, {
            success: function(returnDoc) {
                utilsLib.showSuccess('The database description and the notes/comments have been saved.')
                doc._rev = returnDoc.rev; // save new rev
            },
            error: function(errId, errStr, details) {
                // conflict
                if (errId === 409) {
                    utilsLib.showError('Changes cannot be saved. '+
                        'Data has been updated by another user. '+ 
                        'Copy your changes and reload the page.' );
                }
            }
        });
    }
    return false;
}