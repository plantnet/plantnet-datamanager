function(mm, mms) {
	$$(this).app.data.mm = mm;
    $$(this).app.data.orig_mm_json = JSON.stringify(mm); // deep copy
    $$(this).app.data.mms = mms;
    
    return {mm: mm}; 
};