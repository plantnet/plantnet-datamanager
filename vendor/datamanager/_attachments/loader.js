function loadLib(scripts) {
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="'+scripts[i]+'"><\/script>');
    };
};

loadLib([
    'vendor/jquery-ui/jquery-ui-1.8.24.custom.min.js',
    'vendor/jquery/form/jquery.form.js',
    'vendor/jquery/autocomplete/jquery.autocomplete.min.js',
    'vendor/jquery/colorbox/jquery.colorbox.min.js',
    'vendor/jquery-ui/timepicker/jquery-ui.timepicker.js',
    'vendor/jquery/imagesloaded/jquery.imagesloaded.min.js',
    'vendor/jquery/exif/jquery.exif.js'
]);