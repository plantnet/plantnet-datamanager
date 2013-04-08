var serverName = window.location.hostname;
if (serverName.indexOf('.') != -1) {
    serverName = serverName.substring(0, serverName.indexOf('.'));
}

// Boostrap actions
$(document).ready(function() {
    $('#app').on('click', 'button[data-toggle="modal"], a[data-toggle="modal"]', openModal);
    
    $('a[rel="tooltip"], .has-tooltip').tooltip();
    
});

function openModal(event) {
    var targetId = $(this).is("button") ? $(this).attr('data-target') : $(this).attr('href'),
        targetDialogName = convertTargetIdToDialogName(targetId)
    
    $.log('Openning dialog : ' + targetDialogName);
    $('#dialog-bloc').trigger(targetDialogName);
    $(targetId + '-modal').modal('show');
    
    event.stopPropagation()
    return false;
}

function convertTargetIdToDialogName(id) {
    id = id.slice(1);
    id = id.replace('-', ' ');
    id = id.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    id = id.charAt(0).toLowerCase() + id.substr(1);
    id = id.replace(' ', '');
    return id;
} 
