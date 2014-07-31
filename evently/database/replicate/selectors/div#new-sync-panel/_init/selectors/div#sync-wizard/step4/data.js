function(e, step3Data) {

    return {
        data: step3Data,
        get: (step3Data.direction == 'get'),
        put: (step3Data.direction == 'put'),
        local: (step3Data.database.host == 'local'),
        remote: (step3Data.database.host != 'local'),
        all: (step3Data.what.mode == 'all'),
        structures: (step3Data.what.mode == 'advanced'),
        queries: (step3Data.what.mode == 'queries'),
        selections: (step3Data.what.mode == 'selections'),
        continuous: step3Data.continuous
    };
}