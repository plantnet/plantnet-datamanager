function (dbId, links, localDbs) {
    var app = $$(this).app,
        currentDbName = app.db.name,
        isAdmin = app.userCtx.isSuperAdmin,
        direction = $('input[name="direction"]:checked').val();
        dbLinks = [];

    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        link.selected = (link.name === dbId);
        link.isRemote = true;
        dbLinks.push(link);
    }

    for (var i = 0; i < localDbs.length; i++) {
        var d = localDbs[i];
        if (d.name != currentDbName) {
            if ((direction == 'get') || isAdmin || ((d.role == 'writer') || (d.role == 'admin'))) { // if "put", needs writing rights!
                var name = d.name + ' (local)';
                dbLinks.push({
                    name: name,
                    dbname: d.name,
                    url: 'local://' + d.name, selected: (dbId === d.name),
                    isRemote: false
                });
            }
        }
    }

    dbLinks.sortBy('name');

    return {
        db_links: dbLinks
    };
}