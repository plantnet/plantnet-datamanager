function loadLib(scripts) {
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="'+scripts[i]+'"><\/script>');
    };
};

loadLib([
    'vendor/jquery-ui/jquery-ui-1.9.2.custom.min.js',
    'vendor/jquery/form/jquery.form.js',
    'vendor/jquery/autocomplete/jquery.autocomplete.min.js',
    'vendor/jquery/colorbox/jquery.colorbox.min.js',
    'vendor/jquery-ui/timepicker/jquery-ui.timepicker.js',
    'vendor/jquery/imagesloaded/jquery.imagesloaded.min.js',
    //'vendor/bootstrap/bootstrap-datepicker/bootstrap-datepicker.js',
    'vendor/jquery/exif/jquery.exif.js'
]);