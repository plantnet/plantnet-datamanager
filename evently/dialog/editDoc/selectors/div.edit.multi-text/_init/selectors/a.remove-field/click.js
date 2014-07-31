function() {
	var answer = confirm('Remove this field ?');
	if (answer) {
		$(this).parent('div').remove();
	}
    return false;
}