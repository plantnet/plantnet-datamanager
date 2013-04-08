function(nbdocs, conflict_data, showConflicts) {
    var conflictsNber = 0;

    if (conflict_data && conflict_data.rows && conflict_data.rows.length) {
        conflictsNber = conflict_data.rows[0].value;
    }
 
    return {
        nb_docs: nbdocs,
        show_conflicts: showConflicts,
        nb_conflicts: conflictsNber
    };
}