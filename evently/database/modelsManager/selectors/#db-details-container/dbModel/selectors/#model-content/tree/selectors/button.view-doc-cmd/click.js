function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('ul.treenode input.ck:checked');

    /*app.db.dm("save_doc", {}, {},
        function(data) {
            $.log('--SUCCESS', data);
        },
        function(error) {
            $.log('--ERROR', error);
        },
        5000,
        function(complete) {
            $.log('--COMPLETE', complete);
        }
    );
    return;*/

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one node to see the details');
    } else {
        var idDoc = ck.val();
        $.pathbinder.go('/viewdoc/' + idDoc);
    }
}