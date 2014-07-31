function(newDoc, oldDoc, userCtx) {
    // accept _design/mm
    if (newDoc._id.slice(0, 10) === '_design/mm' || newDoc.$type === 'dm_node') {
        return;
    }
    throw({forbidden : 'write is forbidden on this db'});
}