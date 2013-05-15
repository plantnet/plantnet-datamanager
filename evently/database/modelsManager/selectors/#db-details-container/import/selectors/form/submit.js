function(evt) {
    var mm = evt.data.args[0],
        app = $$(this).app,
        utilsLib = app.getlib('utils'),
        //mmLib = app.getlib('mm'),
        form = $(this);

    var withConflicts = !($("#ignoreconflicts", this).attr("checked"));

    $('#dialog-bloc').trigger('busy', 'Import', 'Importing data');
    $('#busy-modal').modal('show');
    $('#import-error', form).empty();

    function complete() {
        $('#busy-modal').modal('hide');
        if (mm.isref) {
            $.pathbinder.go('/tree/' + mm._id.slice(8) + '/0/0');
        } else {
            $.pathbinder.go('/viewtable/' + mm._id.slice(8) + '/0/_id/0/0/0/0/0');
        }
        utilsLib.showSuccess('Import complete');
    }

    // updates structure when import is done
    function onSuccess() {
        //mmLib.validate_mm(e, app);
        app.db.dm('update_mm', {mm: mm._id}, null, null, null, null,
            function() { // onComplete
                complete();
            }
        );
    }

    function onError(a, b, c, d) {
        $('#busy-modal').modal('hide');
        utilsLib.showError('Error : ' + (a ? a : '') + ' ' + (b ? b : '') + ' ' + (c ? c : ''));

        if (d) {
            var err_txt = '<ul>';
            for (var i = 0; i < d.length; d++) {
                err_txt += '<li>Missing attachement : ' + d[i] + '</li>';
            }
            err_txt += '</ul>';
            $.log(err_txt);
            $('#import-error', form).append(err_txt);
        }
    }

    // get col info
    var colMap = [];
    $('table#colmap tbody tr').each(function(i, e) {
        var //csv_col = $('span.csv-col', this).text(),
            isIndex = !!$('input:checkbox:checked', this).val(),
            colData = $('select', this).val().split('#');

        colMap.push({
            is_index: isIndex,
            modi: colData[1],
            field: colData[0],
            type: colData[2]
        });
    });

    var importLib = app.getlib('import'),
    csvData = app.data.csv;

    app.data.lock_changes = Date.now() + 120000; // lock for 120 sec; // porky it's me
    importLib.import_csv(app.db, csvData, mm, colMap, withConflicts,
                         onSuccess, onError);

    return false;
}