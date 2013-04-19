function() {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        ck = $('ul.treenode input.ck[value!=""]:checked');

    if (ck.length != 1) {
        utilsLib.showWarning('Please select only one node to see the details');
    } else {
        var idDoc = ck.val();
        $.pathbinder.go('/viewdoc/' + idDoc);
    }
}