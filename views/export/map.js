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
            emit([doc.$mm, doc._id], null);
        }
    }
}