function (dbId, links, localDbs) {
    var currentDbName = $$(this).app.db.name,
        dbLinks = [];
    
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.selected = (link.name === dbId);
        dbLinks.push(link);
    }
    
    for (var i = 0; i < localDbs.length; i++) {
        var d = localDbs[i];
        if (d != currentDbName) {
            var name = d + ' (local)';
            dbLinks.push({name: name, url: 'local://' + d, selected: (dbId === d)});
        }
    }

    dbLinks.sortBy('name');

    return {db_links: dbLinks};
}