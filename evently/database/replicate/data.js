function(mms, selections, queries, links, localdbs, db_id) {
    return {
        selections: selections.rows,
        queries: queries.rows,
        mms: mms
    };    
}