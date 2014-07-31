// purges all the documents for the given structure id,
// only for the given modi / modt if specified, else for the whole structure
var libPurge = require('purge');

function purgeStructureDocs(db, structId, mod) {

    var view = 'by_mm',
        key = structId;

    if (mod != undefined) {
        view = 'by_mod';
        key = [structId, mod];
    }

    // get all docs ids
    db.view('datamanager', view, {
        key: key,
        reduce: false
    }, function(err, data) {
        if (err) {
            q.send_error(err);
            return false;
        }
        libPurge.purgeDocs(db, data, function(err, data) {
            log('received callback from libpurge');
            if (err) {
                log('err!!');
                q.send_error(err);
                return false;
            }
            log('all ok');
            q.send_json(data);
        });
    });
}

purgeStructureDocs(q.db, q.params.structId, q.params.mod);