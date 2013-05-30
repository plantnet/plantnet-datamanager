function(e, step2Data) {

    var hasFilter = false;

    step2Data.what.needsFilter = false;

    // Will we use a filter? Only if some "data" checkbox was checked
    if (step2Data.what.mode == 'advanced') {
        for (var i=0, l=step2Data.what.structures.length; i < l; i++) {
            if (step2Data.what.structures[i].data === true) {
                step2Data.what.needsFilter = true;
                hasFilter = true;
                break;
            }
        }
    }

    return {
        hasFilter: hasFilter
    };
}