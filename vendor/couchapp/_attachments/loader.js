function couchapp_load(scripts) {
    for (var i = 0; i < scripts.length; i++) {
        document.write('<script src="'+scripts[i]+'"><\/script>');
    };
};

couchapp_load([
    '/_utils/script/sha1.js',
    '/_utils/script/json2.js',
    'vendor/jquery/jquery-1.8.2.min.js',
    'vendor/couchapp/jquery.couch.js',
    'vendor/couchapp/jquery.couch.app.js',
    'vendor/couchapp/jquery.mustache.js',
    'vendor/couchapp/jquery.evently.js',
    'vendor/couchapp/jquery.evently.couch.js',
    'vendor/couchapp/jquery.pathbinder.js'
]);