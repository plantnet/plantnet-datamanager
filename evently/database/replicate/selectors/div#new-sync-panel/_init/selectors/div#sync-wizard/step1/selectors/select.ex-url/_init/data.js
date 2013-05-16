function (dbId, links, localDbs) {
    var currentDbName = $$(this).app.db.name,
        dbLinks = [];

    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.selected = (link.name === dbId);
        link.isRemote = true;
        dbLinks.push(link);
    }

    for (var i = 0; i < localDbs.length; i++) {
        var d = localDbs[i];
        if (d != currentDbName) {
            var name = d + ' (local)';
            dbLinks.push({
                name: name,
                dbname: d,
                url: 'local://' + d, selected: (dbId === d),
                isRemote: false
            });
        }
    }

    dbLinks.sortBy('name');

    return {
        db_links: dbLinks
    };
}