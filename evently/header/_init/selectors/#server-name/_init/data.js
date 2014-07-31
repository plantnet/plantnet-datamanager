function(serverName, serverType) {
    var app = $$(this).app,
        serverTypeClass = '';
    switch (serverType) {
        case 'prod' :
            serverTypeClass = 'alert-success'
            break;
        case 'test' :
            serverTypeClass = 'alert-info'
            break;
        case 'devel' :
            serverTypeClass = 'alert-error'
            break;
    }
    
    // Server info cache
    app.server = {name: serverName, type: serverType, typeClass: serverTypeClass};
    
    return {server_name: serverName};
};