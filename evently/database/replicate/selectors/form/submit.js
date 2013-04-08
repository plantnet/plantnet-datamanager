function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        replicate = app.getlib('replicate'),
        form = $('#sync-panel .tab-pane.active form'),
        action = $('#sync-panel .tab-pane.active').data('sync-action'),
        login = $('input[name="db_login"]', form).val(),
        pwd = $('input[name="db_pwd"]', form).val(),
        url = $('.ex-url', form).val(),
        fullUrl = url.replace('local://', '');
    
    // Check and execute
    if (!url || !url.length) {
        utilsLib.showError('Please select a distant database.');
    } else {
        if (login) {
            var prefix = login + ':' + pwd + '@';
            fullUrl = url.replace('http://', 'http://' + prefix);
        }
        
        var source, target;
        if (action == 'push') {
            source = app.db.name;
            target =  fullUrl;
        } else { // pull
            source = fullUrl;
            target = app.db.name;
        }
    
        // get filter param
        var filters = {},
            okFilter = false;
        
        $(':checked[name="filter"]', form).each(function() {
            okFilter = true;
            filters[this.value] = '1';
        });
        if (filters.app) {
            filters['_design/datamanager'] = true;
        }
    
        // get selections
        var selections = [];
        $(':checked[name="selection"]', form).each(function() {
            selections.push(this.value);
        });
    
        // get selections
        var queries = [];
        $(':checked[name="query"]', form).each(function() {
            queries.push(this.value);
        });

        // something to exchange ?
        if (!okFilter && !selections.length && !queries.length) {
            utilsLib.showWarning('Nothing to exchange');
        } else {
            function onSuccess(id, name, length) {
                utilsLib.showSuccess('Sync successfull.');
                $('activeTasks').modal('hide');
            }

            function onError(x, y, z) {
                utilsLib.showError('Error during exchange : ' + y + ' ' + z);
            }
            
            $('#dialog-bloc').trigger('confirmSync', [{
                action: action,
                db: app.db,
                source: source,
                target: target,
                filters: filters,
                selections: selections,
                queries: queries,
                onSuccess: onSuccess,
                onError: onError
            }]);
        }
    }
    return false; // no redirection
}