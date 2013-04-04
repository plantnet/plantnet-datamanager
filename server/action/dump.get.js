var filename = q.params.filename || "dump.json",
    cpt = 1,
    cptAtt = {},
    firstDoc = true,
    docs;

function sendDoc(doc) {
    if (firstDoc) {
        q.send_chunk(JSON.stringify(doc));
        firstDoc = false;
    } else {
        q.send_chunk(",\n" + JSON.stringify(doc));
    }
}

function sendDocWithAttachments(doc) {
    cptAtt[doc._id]--;
    if (cptAtt[doc._id] == 0) {
        sendDoc(doc);
        delete cptAtt[doc._id];
        end();
    }
}

function end() {
    cpt--;
    if(cpt == 0) {
        q.send_chunk(']');
        endStream();
    }
}

function endStream() {
    //log('dump: ending stream');
    q.end_stream();
}

var commons = require('commons');

// start progressive downloading
//log('dump: starting stream');
q.start_stream(filename);
q.send_chunk('[');

db.allDocs({
        include_docs : true,
        attachments : true
    }, function(err, data) {

       docs = data.rows.map(function (e) {
           return e.doc;
       });
       docs = docs.filter(function(e) {
           return e._id !== "_design/datamanager";
       });

       for (var i = 0, l = docs.length; i < l; i++) {

           var d = docs[i];
           cpt++;

           if (commons.objectEmpty(d._attachments)) {
               // no attachments - send raw doc
               sendDoc(d);
               end();
           } else {
               cptAtt[d._id] = 0;
               // get attachments
               for(var a in d._attachments) {
                   cptAtt[d._id]++;
                   db.getAttachment(d._id, encodeURIComponent(a), function(doc, att) {
                       return function(err, data) {
                           var buf = new Buffer(data, 'binary');
                           doc._attachments[att].data = buf.toString('base64');
                           delete doc._attachments[att].stub;
                           sendDocWithAttachments(doc);
                       };
                   }(d, a));
               }
           }
       }
       end();
   });