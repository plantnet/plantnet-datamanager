function(e, params) {

    return {
        isDictionary: params.isRef,
        nbdocs: params.ids.length,
        plural: params.ids.length > 1
    }
}