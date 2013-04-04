function(event, msg, title) {
    var utilsLib = $$(this).app.getlib('utils'),
        message = [];

    if (utilsLib.is_array(msg)) {
        for (var i = 0, l = msg.length; i < l; i++) {
            message.push({text: msg[i]})
        }
    } else {
        message = [{text: msg}];
    }

    return {
        title: title || 'System busy',
        message: message || [{ text: 'working...' }]
    };
}