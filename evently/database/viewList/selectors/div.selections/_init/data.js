function(data, isSelection) {
    return {
        isSelection: isSelection,
        has_selections: !!data,
        selections: data
    };
}