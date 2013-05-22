function(replications) {
    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        db = app.db,
        outgoing = [],
        incoming = [];

    // transform and format info data
    for (var i=0, l=replications.length; i<l; i++) {
        var rep = replications[i];
        //$.log('Replication ' + i + ':', rep);

        if (rep._replication_state == 'triggered') {
            rep._replication_state = 'running';
        }

        // remove login/password from remote db url
        if (rep.source.indexOf('@') > -1) {
            rep.isRemote = true;
            rep.source = 'http://' + rep.source.substr(rep.source.indexOf('@') + 1);
        }
        if (rep.target.indexOf('@') > -1) {
            rep.isRemote = true;
            rep.target = 'http://' + rep.target.substr(rep.target.indexOf('@') + 1);
        }

        rep.status_and_time = rep._replication_state;
        if (('started_on' in rep) && ('updated_on' in rep)) {
            var timeElapsed = (rep.updated_on - rep.started_on);
            rep.status_and_time += ' (' + utilsLib.secondsToString(timeElapsed) + ')';
        }

        if (rep._replication_state == 'completed' && ('_replication_stats' in rep)) {
            rep.progress = 100;
            rep.checkpointed_source_seq = rep._replication_stats.checkpointed_source_seq;
            rep.doc_write_failures = rep._replication_stats.doc_write_failures;
            rep.docs_read = rep._replication_stats.docs_read;
            rep.docs_written = rep._replication_stats.docs_written;
            rep.missing_revisions_found = rep._replication_stats.missing_revisions_found;
            rep.revisions_checked = rep._replication_stats.revisions_checked;
        }

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