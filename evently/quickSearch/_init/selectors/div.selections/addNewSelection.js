function(e, docIds, label) {
    if (docIds.length > 0) {
        var $this = $(this),
            app = $$(this).app,
            utilsLib = app.getlib('utils'),
            db = app.db;
     
        if (!label || typeof(label) != 'string') {
            label = prompt('Enter a label for this selection :');
        }
        if (label && label.length) {
            var sdoc = { 
                $type: 'selection',
                name: label,
                ids:  docIds
            };
            db.saveDoc(sdoc, {success: function() {
                $this.trigger('_init');
                $('div.selections').trigger('_init');
                utilsLib.showSuccess('A new selection "' + label + '" has been added and contains the selected documents.')
            }});
        }
    }
}