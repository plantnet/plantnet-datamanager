function(callback, e) {
    var app = $$(this).app,
        dmDb = $.couch.db('datamanager'),
        serverName = window.location.hostname,
        serverType = 'localhost';
    
    if (serverName == '127.0.0.1') {
        serverName = 'localhost';
    } else if (serverName.indexOf('.') != -1) {
        serverName = serverName.substring(0, serverName.indexOf('.'));
    }

    dmDb.openDoc('_local/config', {
        success: function(data) {
            if (data.server_name) {
                serverName = data.server_name;
            }
            if (data.server_type) {
                serverType = data.server_type;
            }
            callback(serverName, serverType);
        },
        error: function() {
            callback(serverName, serverType);
        }
    }, 'datamanager');
};