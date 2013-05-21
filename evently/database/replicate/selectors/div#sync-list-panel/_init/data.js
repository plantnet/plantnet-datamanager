function(replications) {
    var app = $$(this).app,
        db = app.db,
        outgoing = [],
        incoming = [];

    for (var i=0, l=replications.length; i<l; i++) {
        var rep = replications[i];
        $.log('Replication ' + i + ':', rep);

        //rep.date_started = new Date(rep.started_on * 1000).toLocaleString();
        //rep.date_updated = new Date(rep.updated_on * 1000).toLocaleString();

        if (rep.source == db.name) {
            outgoing.push(rep);
        } else if (rep.target == db.name) {
            incoming.push(rep);
        } else {
            $.log('cannot match replication ' + rep.source + ' => ' + rep.target + ' to ' + db.name);
        }
    }

    // latest first
    function sortByDateStartedThenDateUpdated(a, b) {
        if (a.started_on > b.started_on) {
            return -1;
        } else if (a.started_on < b.started_on) {
            return 1;
        } else {
            if (a.updated_on > b.updated_on) {
                return -1;
            } else if (a.updated_on < b.updated_on) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    incoming.sort(sortByDateStartedThenDateUpdated);
    outgoing.sort(sortByDateStartedThenDateUpdated);

    return {
        outgoing: outgoing,
        incoming: incoming,
        hasOutgoing: outgoing.length,
        hasIncoming: incoming.length
    };
}