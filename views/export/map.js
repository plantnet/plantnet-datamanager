/**
 * Returns docs sorted by mm, with mm doc first, then all docs of this mm sorted by _id
 */
function (doc) {

    if (doc.$type == 'mm') {
        emit([doc._id, 0], null);
    }

    //if (! doc.$type) { // regular docs
    if(doc.$modi) {
        if (doc.$mm) {
            //emit([doc.$mm, doc._id], null);
            var k = [doc.$mm];
            if (doc.$path) {
                k = k.concat(doc.$path);
            }
            k = k.concat([doc._id]);
            
            // k => [mm, path1, path2, ..., doc._id]
            emit(k, null);
        }
    }
}