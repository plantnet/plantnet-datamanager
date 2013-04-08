function(e) {
    var $this = $(this),
        db = $$(this).app.db,
        selectionId = $('.doc-list[data-list-id]').attr('data-list-id')
        indexList = [];
    
    $('.doc-list .ck:checked').each(function() {
        var index = $this.attr('data-idx');
        indexList.push(index); 
    });

    if (!indexList.length) {
        utilsLib.showWarning('Please select at least one doc for removing it from current selection.');
    } else {
        // save selection
        db.openDoc(selectionId, {
            success: function (selectionDocs) {
                if (selectionDocs && selectionDocs.$type === 'selection') {
                    if (indexList.length > 0) {
                        $.each(indexList, function(key, selectionIdx) {
                            selectionDocs.ids.splice(selectionIdx, 1);
                        });
    
                        if (selectionDocs.ids.length == 0) {
                            selectionDocs._deleted = true;
                        }
    
                        db.saveDoc(selectionDocs, {
                            success: function() {
                                $.pathbinder.begin();
                                $('#selections').trigger('_init');
                            }
                        });
                    }
                }
            }
        });
    }

    return false;
}