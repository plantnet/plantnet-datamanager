function(evt) {
    var mm = evt.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        //mmLib = app.getlib('mm'),
        form = $(this);

    var withConflicts = !($('#ignoreconflicts', this).attr('checked')),
        overwrite = ($('#overwrite', this).attr('checked') == 'checked'),
        notrim = ($('#notrim', this).attr('checked') == 'checked');

    $('#dialog-bloc').trigger('busy', ['Import', 'Importing data', true]);
    $('#busy-modal').modal('show');
    $('#import-error', form).empty();

    // callback from import lib to update nb docs processed / progress bar
    function updateStats(docsProcessed, totalDocs) {

        var percent = (docsProcessed / totalDocs) * 100,
            modal = $('#busy-modal'),
            progressBar = modal.find('.progress .bar'),
            spanDocsProcessed = modal.find('.docs-processed'),
            spanTotalDocs = modal.find('.docs-total');

        progressBar.attr('style', 'width: ' + percent + '%;');
        spanDocsProcessed.html(docsProcessed);
        spanTotalDocs.html(totalDocs);
    }

    function complete() {
        $('#busy-modal').modal('hide');
        // do not redirect, so that the import report stays visible
        utilsLib.showSuccess('Import complete');
    }

    function onSuccess(attchs_err) {
        if (attchs_err) {
            showErrorReport(attchs_err);
        }
        complete();
    }

    function onError(a, b, c, d) {
        $('#busy-modal').modal('hide');
        utilsLib.showError('Error : ' + (a ? a : '') + ' ' + (b ? b : '') + ' ' + (c ? c : ''));
        if (d) {
            showErrorReport(d);
        }
        complete();
    }

    function showErrorReport(errData) {
        var err_txt = '<ul>';
        for (var i = 0; i < errData.length; i++) {
            err_txt += '<li>Missing attachement : ' + errData[i] + '</li>';
        }
        err_txt += '</ul>';
        //$.log(err_txt);
        $('#import-error', form).append(err_txt);
    }

    // get col info
    var colMap = [],
        hasAttachments = false;

    $('table#colmap tbody tr').each(function(i, e) {
        var //csv_col = $('span.csv-col', this).text(),
            isIndex = !!$('input:checkbox:checked', this).val(),
            colData = $('select', this).val().split('#');

        hasAttachments = (hasAttachments || (colData[0] == '$attachment') || (colData[0] == '$local_file'));

        colMap.push({
            is_index: isIndex,
            modi: colData[1],
            field: colData[0],
            type: colData[2]
        });
    });

    var importLib = app.getlib('import'),
    csvData = app.data.csv;

    app.data.lock_changes = Date.now() + 360000; // lock for 360 sec; // porky it's me
    importLib.import_csv(app.db, csvData, mm, app.userCtx, notrim, hasAttachments, colMap, withConflicts, overwrite,
                         onSuccess, onError, updateStats);

    return false;
}
