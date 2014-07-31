var lib = require('commons');

//purges all the docs in data (meant to be fed by a view - by_mm or by_mod for ex.)
//data must be of the following form (containing at least "id" and "value._rev"):
//data {
// rows: [
//     { id: "thedocumentid", ..., value: { _rev: 1-437298375303874027, ... }
//....]
//}
exports.purgeDocs = function(db, data, callback) {
    // get current sequence to optimize further reading of _changes
    var currentSequence = 0;
    db.info(function(err, info) {
        if (err) {
            callback('Error while getting db sequence info');
            return false;
        }
        currentSequence = info.update_seq;
        //log('Current update sequence: ' + currentSequence);

        var docs = data.rows.map(function(e) {
            return {
                _id: e.id,
                _rev: e.value._rev,
                _deleted: true
            }
        });
        // delete the documents first with a POST to /_bulk_docs so that
        // lucene detects a change and updates its index (_purge triggers no change)
        db.bulkDocs({
            docs: docs,
            "all_or_nothing" : true
        }, function (err, data) {
            if (err) {
                callback('Error while bulk deleting: ' + JSON.stringify(err));
                return false;
            }
            // read _changes feeds to find deleted docs revisions
            db.changes({
                since: currentSequence
            }, function(err, data) {
                if (err) {
                    callback('Error while reading _changes feed');
                    return false;
                }
                var change,
                deletedRevs = {};
                for (var i=0; i < data.results.length; i++) {
                    change = data.results[i];
                    //log('found change: ' + JSON.stringify(change));
                    deletedRevs[change.id] = (change.changes && change.changes.length) ? change.changes[0].rev : null;
                }
                //log('all deleted revs');
                //log(deletedRevs);
                // for each doc, get a list of conflicting revisions
                var purgeData = {};
                lib.asyncForEach(docs, function(item, next) {
                    //log('Opening doc: ' + item.id);
                    // @TODO not sure if "conflicts=true" works here - isn't a
                    // deleted doc supposed to be conflicts-free anyway?
                    // - in this case, remove this painful open-each-doc operation
                    // @TODO manage _deleted_conflics - see http://stackoverflow.com/questions/6276085/deleted-conflicts-in-couchdb
                    db.getDoc(encodeURIComponent(item._id) + '?rev=' + deletedRevs[item._id] + '&conflicts=true', function(err, data) {
                        if (err) {
                            //log('error while getting doc _conflicts');
                        } else {
                            //log('data received: ' + data);
                            if (data._conflicts) {
                                purgeData[item._id] = data._conflicts;
                            } else {
                                purgeData[item._id] = [data._rev];
                            }
                        }
                        next();
                    });
                }, function() { // this is the "next()"
                    // purge all that s**t !
                    //log('paré à purger!');
                    //log(purgeData);
                    doPurge(db, purgeData, function(err, data) {
                        log('doPurge has returned');
                        if (err) {
                            log('with err');
                            callback('Error calling _purge: ' + JSON.stringify(err));
                            return false;
                        }
                        log('with success');
                        callback(false, 'Purge complete');
                    });
                });
            });
        });
    });
};

// POSTs purgeData to db/_purge
function doPurge(db, purgeData, cb) {
    db.request({
        path: '/_purge',
        data: purgeData,
        method: 'POST'
    }, cb);
}