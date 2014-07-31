function(e, params) {

	var isView = false;
	if (params.view && params.view.$type == 'view') {
		isView = true;
	}

    return {
        isDictionary: params.isRef,
        isView: isView
    }
}