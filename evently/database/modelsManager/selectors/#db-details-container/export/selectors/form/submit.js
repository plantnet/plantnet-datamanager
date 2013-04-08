function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        mmId = $(this).data('mm-id'),
        separator = $('input[name="separator"]', this).val(),
        expandGeoloc = $('input[name="expand-geoloc"]', this).attr('checked') ? true : false
        exportSynonymy = $('input[name="export-synonymy"]', this).attr('checked') ? true : false;

    separator = separator.trim()[0];
    if (!separator) {
        separator = ',';
    }

    mmId = utilsLib.decode_design_id(mmId);
    app.db.openDoc(mmId, {
        success: function(mm) {
            var filename = mm.name.replace(' ', '_');
            var url = '_list/all2csv/export'
                + '?include_docs=true'
                + '&startkey='
                + encodeURIComponent('["' + mmId + '"]')
                + '&endkey='
                + encodeURIComponent('["' + mmId + '", {}]')
                + '&separator='
                + encodeURIComponent(separator)
                + '&expand_geoloc=' 
                + encodeURIComponent(expandGeoloc)
                + '&export_synonymy=' 
                + encodeURIComponent(exportSynonymy)
                + '&fn=' + filename + '.csv';
            window.location.href = url;
        }
    });
    
    return false;
}