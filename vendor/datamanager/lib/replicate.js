var utils = require('vendor/datamanager/lib/utils');

// abstraction for a replication
exports.Replicator = function(db, src, tgt) {
    this.db = db;
    this.source = src;
    this.target = tgt;
};

// save replication change in a selection
// execute callback (id_selection, name, length)
exports.Replicator.prototype.save_change = function(start_seq, callback) {
    var lthis = this;
    // get local last sequence number
    this.db.info({
        success: function(info) { 
            var end_seq = info.update_seq;
            var limit = end_seq - start_seq;
            $.getJSON(
                lthis.db.uri + '_changes?since=' + start_seq + '&limit=' + limit,
                function (data) {
                    if (!data.results.length) {
                        callback();
                    } else {
                        var ids = [];
                        data.results.map(function(e) { if (e.id.split('##') > 1) { ids.push(e.id); } });
                        if (ids.length) {
                            var name = 'exchange-changes-' + start_seq + '-' + end_seq;
                            var sdoc = { 
                                $type: 'selection',
                                ids: ids,
                                name: name
                            };
                            lthis.db.saveDoc(sdoc, {
                                success: function(e) {
                                    callback(e.id, sdoc.name, sdoc.ids.length);
                                }
                            });
                        } else {
                            callback();
                        }
                    }
                }
            );
        }
    });
};

exports.Replicator.prototype.replicate_all = function(onSuccess, onError) {
    $.couch.replicate(this.source, this.target, {
        success: onSuccess,
        error: onError,
        timeout: 10000000
    },  {/*create_target : true*/});
};

exports.Replicator.prototype.cancel = function(onSuccess, onError) {
    $.couch.replicate(this.source, this.target, {
        success: onSuccess,
        error: onError,
        timeout : 10000
    }, {
        cancel: true
    });
};

exports.Replicator.prototype.replicate_ids = function(ids, onSuccess, onError) {
    if (!ids) {
        onSuccess();
        return;
    }
    $.couch.replicate(this.source, this.target, {
            success: onSuccess,
            error: onError
        },
        {
            /*create_target : true,*/
            doc_ids: ids
        }
    );
};

exports.Replicator.prototype.replicate_filter = function(filter, onSuccess, onError) {
    if ($.isEmptyObject(filter)) {
        onSuccess();
        return;
    }
    $.couch.replicate(this.source, this.target, {
            success: onSuccess,
            error: onError,
            timeout: 6000000
        },
        {
            /*create_target : true,*/
            filter: 'datamanager/replication',
            query_params: filter
        }
    );
};

// return the ids found in selections and in queries
// selections is a list of selection id
exports.Replicator.prototype.get_ids = function(selections, queries, out, callback, onError) {
    var lthis = this;
    selections.asyncForEach(function(e, next) {
        lthis.db.openDoc(e, {
            success : function(s) {
                if (s.$type === 'selection') {
                    Array.prototype.push.apply(out, s.ids);
                    next();
                } else if (s.$type === 'query') {
                    var query = require('vendor/datamanager/lib/query');
                    // query.getIds(lthis.db, s.query, function (ids) {
                    // Array.prototype.push.apply(out, ids);
                    // next();
                    // }, function () {
                    //     onError(500, "Cannot reach", "Query server");
                    // });
                }
            }
        });
    }, function () { 
        lthis.expand_ids(out, callback); 
    });
};

// from a list of ids, get parents ids to keep data cohesion
exports.Replicator.prototype.expand_ids = function(out, cb) {
    var ids = out.unique(),
        tmp = [];
    out.length = 0;

    this.db.view('datamanager/path', {
        keys: ids,
        success: function (data) {
            data.rows.forEach(function (e) {
                var p = e.value.path || [];
                Array.prototype.push.apply(tmp, p);
            });
            tmp = tmp.unique();
            Array.prototype.push.apply(out, tmp);
            cb();
        },
        error: cb
    });
};

// replication
// if success : execute callback (id_selection, name, length)
exports.Replicator.prototype.replicate = function(filters, selections, queries, onSuccess, onError) {
    var lthis = this;
    // get local last sequence number
    this.db.info({
        success: function (info) { 
            var start_seq = info.update_seq;

            // wrap success function
            function save_change () {
                //$.log("rep ok");
                lthis.save_change(start_seq, onSuccess);
            }

            // full replication 
            if (filters.all) {
                //$.log('replicate all!');
                lthis.replicate_all(save_change, onError);
            } else {
                //$.log('replicate with filters!');
                // replication by filter & by ids
                lthis.replicate_filter(filters, function () {
                    //$.log("on success replicate_filters");
                    if (selections.length) {
                        // load ids
                        var ids = [];
                        lthis.get_ids(selections, queries, ids, function () {
                            //$.log('replicate ids!');
                            lthis.replicate_ids(ids, save_change, onError);
                        }, onError);
                    } else { // no selections
                        save_change();
                    }
                }, onError);
            }
        }
    });
};