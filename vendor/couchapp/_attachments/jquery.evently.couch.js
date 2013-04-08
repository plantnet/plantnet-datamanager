// CouchDB specific code

// _changes plugin
(function($) {
  $.evently.fn.setup._changes = function(ev, args) {
    var elem = this
      , app = $$(this).app;
      if (app) {
          followChanges(app, elem);
      }
  };
  // only start one changes listener per db
  function followChanges(app, elem) {
    var dbName = app.db.name, changeEvent = function(resp) {
        elem.trigger("_changes", [resp]);
        //$("body").trigger("evently-changes-"+dbName, [resp]);
    };
    if (!$.evently.changesDBs[dbName]) {
        app.db.changes(null, $.evently.changesOpts).onChange(changeEvent);
        $.evently.changesDBs[dbName] = true;
    }
  }
  $.evently.followChanges = followChanges;

})(jQuery);


// query plugin
(function($) {  
  // this is for the items handler
  // var lastViewId, highKey, inFlight;
  // this needs to key per elem
  function newRows(elem, app, view, opts) {
    // $.log("newRows", arguments);
    // on success we'll set the top key
    var thisViewId, successCallback = opts.success, full = false;
    function successFun(resp) {
      // $.log("newRows success", resp)
      $$(elem).inFlight = false;
      var JSONhighKey = JSON.stringify($$(elem).highKey);
      resp.rows = resp.rows.filter(function(r) {
        return JSON.stringify(r.key) != JSONhighKey;
      });
      if (resp.rows.length > 0) {
        if (opts.descending) {
          $$(elem).highKey = resp.rows[0].key;
        } else {
          $$(elem).highKey = resp.rows[resp.rows.length -1].key;
        }
      };
      if (successCallback) {successCallback(resp, full)};
    };
    opts.success = successFun;
    
    if (opts.descending) {
      thisViewId = view + (opts.startkey ? JSON.stringify(opts.startkey) : "");
    } else {
      thisViewId = view + (opts.endkey ? JSON.stringify(opts.endkey) : "");
    }
    // $.log(["thisViewId",thisViewId])
    // for query we'll set keys
    if (thisViewId == $$(elem).lastViewId) {
      // we only want the rows newer than changesKey
      var hk = $$(elem).highKey;
      if (hk !== undefined) {
        if (opts.descending) {
          opts.endkey = hk;
          // opts.inclusive_end = false;
        } else {
          opts.startkey = hk;
        }
      }
      // $.log("add view rows", opts)
      if (!$$(elem).inFlight) {
        $$(elem).inFlight = true;
        app.view(view, opts);
      }
    } else {
      // full refresh
      // $.log("new view stuff")
      full = true;
      $$(elem).lastViewId = thisViewId;
      $$(elem).highKey = undefined;
      $$(elem).inFlight = true;
      app.view(view, opts);
    }
  };
  
  function runQuery(me, h, args) {
    // $.log("runQuery: args", args)
    var app = $$(me).app;
    var qu = $.evently.utils.rfun(me, h.query, args);
    var qType = qu.type;
    var viewName = qu.view;
    var userSuccess = qu.success;
    // $.log("qType", qType)
    
    var q = {};
    $.forIn(qu, function(k, v) {
      if (["type", "view"].indexOf(k) == -1) {
        q[k] = v;
      }
    });
    
    if (qType == "newRows") {
      q.success = function(resp) {
        // $.log("runQuery newRows success", resp.rows.length, me, resp)
        resp.rows.reverse().forEach(function(row) {
          react(me, h, [row].concat($.argsToArray(args)), true)
        });
        if (userSuccess) userSuccess(resp);
      };
      newRows(me, app, viewName, q);
    } else {
      q.success = function(resp) {
        // $.log("runQuery success", resp)
        react(me, h, [resp].concat($.argsToArray(args)), true);
        userSuccess && userSuccess(resp);
      };
      // $.log(app)
      app.view(viewName, q);      
    }
  }
  
  
  $.evently.fn.before.query = function(h, cb, args) {
    var app = $$(this).app
      , qu = $.evently.utils.rfun(this, h.query, args)
      , qType = qu.type
      , viewName = qu.view
      , userSuccess = qu.success
      , q = {}
      ;
    $.forIn(qu, function(k, v) {
      if (["type", "view"].indexOf(k) == -1) {
        q[k] = v;
      }
    });
    if (qType == "newRows") {
      q.success = function(resp) {
        // $.log("runQuery newRows success", resp.rows.length, me, resp)
        resp.rows.reverse().forEach(cb);
        if (userSuccess) userSuccess(resp);
      };
      newRows(this, app, viewName, q);
    } else {
      q.success = function(resp) {
        // $.log("runQuery success", resp)
        cb(resp);
        userSuccess && userSuccess(resp);
      };
      app.view(viewName, q);      
    }
  };
})(jQuery);



