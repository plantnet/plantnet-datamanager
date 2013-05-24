function(e) {
    e.preventDefault();
    var app = $$(this).app,
        req = $('input[name="q"]', this).val(),
        label = '"' + req + '"';
        q =  encodeURIComponent(req),
        trimmed = req.replace(/ /g, '');

    if (trimmed[0] == '*') {
        app.libs.utils.showError("You can't start a query with *");
        return false;
    }

    var selectStructure = $('select#quicksearch-structure-selector', this),
        selectModule = $('select#quicksearch-module-selector', this),
        structure = selectStructure.val(),
        module = selectModule.val(),
        pathToGo = null;

    if(structure) {
        structure = structure.slice(8);
        q += ' AND _mm:' + encodeURIComponent(structure.replace(/\-/g, ''));
        label += ' in ' + $('option:selected', selectStructure).text();
        if(module) {
            var clause,
                pathbinderModule;
            if (module[0] == '.') {
                clause = ' AND _modi:' + module;
                pathbinderModule = module;
            } else {
                clause = ' AND _modt:' + module;
                pathbinderModule = '*' + module;
            }
            q += clause;
            label += ' → ' + $('option:selected', selectModule).text();
            pathToGo = '/viewtable/' + structure + '/' + pathbinderModule + '/_id/0/0/lucene:' + q + '/0/0';
        } else {
            pathToGo = '/viewlist/lucene/' + q + '/0/' + label + '/0';
        }
    } else {
        pathToGo = '/viewlist/lucene/' + q + '/0/' + label + '/0';
    }

    $.pathbinder.go(pathToGo);

    return false;
}