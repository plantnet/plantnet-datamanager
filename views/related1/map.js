function (doc) {
    // return related doc for an id

    if (doc.$type === "selection") {
        emit(0, null /*{_id: doc._id}*/);
        
    } else if(doc.$modi) {
         var attchs = [],
                a;
            for (a in doc._attachments) {
                attchs.push(a);
            }
            for (a in doc.$attachments) {
                attchs.push(a);
            }
            if(!attchs.length) {
                attchs = null;
            }
            
        // source doc
        emit(doc._id, {_attchs : attchs});

        if (doc.$path) {
            var id, son_emitted = false;

  	    for (var i = doc.$path.length - 1; i >=0 ; i--) { 
                id = doc.$path[i];
                if (!id) { continue; }
                
                // parents
                emit(doc._id, {_id: id}); 
                
                // first non empty son
                if(!son_emitted) {
                    emit(id, {_attchs : attchs}); 
                    son_emitted = true;
                }

	    } 
        }
    }
}

