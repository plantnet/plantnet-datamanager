function() {

    var value = ($(this).attr('checked') == 'checked'),
        select_newModi = $('select#new-modi'),
        input_parent = $('input#parent-label'),
        input_parentId = $('input#parent-id'),
        input_parentModi = $('input#parent-modi'),
        input_parentDeleted = $('input#parent-deleted'),
        default_possibleModis = $('input#possible-modis'),
        input_oldParentModi = $('input#parent-modi-old'),
        dpm = $.parseJSON(default_possibleModis.val());

    select_newModi.find('option').remove();

    if (value) {
        // propose default possible_modis
        for (var i=0; i < dpm['_root'].length; i++) {
            select_newModi.append(
                $('<option>', {
                    value: dpm['_root'][i].id,
                    selected: (dpm['_root'][i].active ? 'selected' : null)
                }).text(dpm['_root'][i].name + ' (' + dpm['_root'][i].id + ')')
            );
        }
        // disable parent input
        input_parent.attr('disabled', 'disabled');
        input_parent.val('');
        input_parentId.val('');
        input_parentModi.val('');
        input_parentDeleted.val(true);
    } else {
        // propose modis from parent
        var opm = input_oldParentModi.val(),
            spm = input_parentModi.val();
        if (spm) {
            opm = spm;
            $.log('A parent was selected, with modi:', opm, 'this should NEVER happen');
        }
        if (! (opm in dpm)) {
            // load default options
            opm = '_root';
        }
        for (var i=0; i < dpm[opm].length; i++) {
            select_newModi.append(
                $('<option>', {
                    value: dpm[opm][i].id,
                    selected: (dpm[opm][i].active ? 'selected' : null)
                }).text(dpm[opm][i].name + ' (' + dpm[opm][i].id + ')')
            );
        }
        // enable parent input
        input_parent.removeAttr('disabled');
        input_parentDeleted.val(false);
    }
}