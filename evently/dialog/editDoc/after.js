function (doc, mm, presets, parent_id, parent_label, parent_modi, synonym_label) {

    var app = $$(this).app,
        mmLib = app.getlib('mm'),
        utilsLib = app.getlib('utils'),
        that = this;

    var shownOnce = false;
    $('#edit-doc-modal').modal({ backdrop: 'static' });
    $('#edit-doc-modal').on('shown', function() { // called multiple times; when hovering a button for ex. wtf??
        if (! shownOnce) {
            $('.modal-body', this).scrollTop(0);
            shownOnce = true;
            $('.editw').first().focus();
        }
    });
    utilsLib.hideBusyMsg('editDoc');

    $('#preset-select-combo').change(function() {
        $('#preset-select-text').val($(this).val());
    });

    // Tab key handler on first and last inputs ------------------------

    var firstInput = $('.editw').first(),
        lastInput = $('.editw').last();

    var fiType = firstInput.parent().data('type');
    if (! fiType) { // on devrait harmoniser ça (geoloc, multi-enum, bool)
        fiType = firstInput.parent().parent().data('type');
    }
    switch (fiType) {
        case 'multi-enum':
            // in bootstrap, dropdown-toggle buttons cannot have focus :-(
            fisrtInput = fisrtInput.parent().find('a.dropdown-toggle').first();
        case 'boolean':
            firstInput = firstInput.parent().find('input').first();
            break;
        case 'geoloc':
            var parentInputs = firstInput.parent().find('input');
            firstInput = parentInputs[1];
            break;
    }
    var liType = lastInput.parent().data('type');
    if (! liType) { // on devrait harmoniser ça (geoloc, multi-enum, bool)
        liType = lastInput.parent().parent().data('type');
    }
    switch (liType) {
        case 'multi-enum':
            // in bootstrap, dropdown-toggle buttons cannot have focus :-(
            lastInput = lastInput.parent().find('a.dropdown-toggle').first();
        case 'boolean':
            var parentInputs = lastInput.parent().find('input');
            lastInput = parentInputs[parentInputs.length - 2];
            break;
        case 'geoloc':
            lastInput = lastInput.parent().find('div').last().find('a').last();
            break;
    }
    $(lastInput).keypress(function(e) {
        var key = e.keyCode || e.which;
        if (key == 9) {
            if (! e.shiftKey) {
                e.preventDefault();
                $.log('set focus on first input');
                firstInput.focus();
            }
        }
    });
    $(firstInput).keypress(function(e) {
        var key = e.keyCode || e.which;
        if (key == 9) {
            if (e.shiftKey) {
                e.preventDefault();
                $.log('set focus on last input');
                lastInput.focus();
            }
        }
    });

    // ------------- parent_id completion & modi change ----------

    var hasChildren = true; // see below

    // defines the right autocomplete function depending on the doc's status, then defines possible modis
    function setAutocompleteAndModis() {
        var pmodi = parent_modi; //utilsLib.get_parent_modi(doc);
        var inputbox = $('input#parent-label', that);
        var labelViewURI = app.db.uri + '_design/datamanager/_list/labelac/label';
        if (! hasChildren) { // view for smart parent change
            labelViewURI = app.db.uri + '_design/datamanager/_list/labelac/' + mm._id.slice(8) + '/label';
            //$.log('setting label view URI to', labelViewURI);
        }
        inputbox.autocomplete(
            labelViewURI, {
                dataType: 'json',

                parse: function(data) {
                    return data.rows.map(function(e) {
                        var label;
                        if (hasChildren) {
                            label = e.key[2];
                        } else {
                            label = e.key[1];
                        }
                        //$.log('hc', hasChildren, 'retourne', label);
                        return {
                            data:e,
                            value:label,
                            result:label
                        };
                    });
                },
                formatItem: function(row) {
                    if (hasChildren) {
                        return row.key[2];
                    } else {
                        return row.key[1];
                    }
                },
                extraParams: {
                    // params for couchdb view
                    //q: '',
                    limit: 500,
                    reduce: false,
                    cache: JSON.stringify(new Date().getTime()),
                    startkey: function() {
                        if (hasChildren) {
                            var v = inputbox.val();
                            if (v.indexOf(' ') > 0) {
                                v = v.substring(0, v.indexOf(' '));
                            }
                            return JSON.stringify([mm._id, pmodi, v]);
                        } else {
                            return JSON.stringify([doc.$modt, inputbox.val()]);
                        }
                    },
                    endkey: function() {
                        if (hasChildren) {
                            var v = inputbox.val();
                            if (v.indexOf(' ') > 0) {
                                v = v.substring(0, v.indexOf(' '));
                            }
                            return JSON.stringify([mm._id, pmodi, v + '\ufff0']);
                        } else {
                            return JSON.stringify([doc.$modt, inputbox.val() + '\ufff0']);
                        }
                    }
                },
                delay: 10,
                max: 50,
                mustMatch: true
            }).result(function(event, item) {

                if (! item) {
                    return;
                }
                // harmonize different views results
                if (hasChildren) {
                    // item.valModi = item.key[1];
                    item.valModi = '_root'; // default possible modis never change if we can't change parent level
                    item.valLabel = item.key[2];
                } else {
                    item.valModi = item.value.modi;
                    item.valLabel = item.key[1];
                }
                // cannot be your own parent - except Jesus maybe
                if (item.valLabel == doc.$label) {
                    alert('Cannot define the doc as its own parent!');
                    $('input#parent-label').val('');
                    $('input#parent-id', that).val('');
                    $('input#parent-modi', that).val('');
                    return;
                }

                $('input#parent-id', that).val(item.id); // useful?
                $('input#parent-modi', that).val(item.valModi); // useful?
                // propose possible modis for the selected parent modi
                var possibleModis = $('input#possible-modis'),
                    select_newModi = $('select#new-modi'),
                    pm = $.parseJSON(possibleModis.val());

                select_newModi.find('option').remove();
                // test moisi pour le cas où 
                for (var i=0; i < pm[item.valModi].length; i++) {
                    select_newModi.append(
                        $('<option>', {
                            value: pm[item.valModi][i].id,
                            selected: (pm[item.valModi][i].active ? 'selected' : null)
                        }).text(pm[item.valModi][i].name + ' (' + pm[item.valModi][i].id + ')')
                    );
                }
            });

        // get possible modis for modi change
        var posModi = {
                '_root': [{
                    id: doc.$modi,
                    name: mm.modules[doc.$modt].name + ' - ' + mm.structure[doc.$modi][3],
                    active: true
                }]
            };
        if (hasChildren) {
            $('input#no-parent').attr('disabled', 'disabled');
            //$('input#parent-label').attr('disabled', 'disabled');
        } else {
            posModi = mmLib.getPossibleModis(mm, doc.$modt, doc.$modi);
        }
        //$.log('posModi', posModi);
        // define into HTML
        var select_newModi = $('select#new-modi');
        $('input#possible-modis').val(JSON.stringify(posModi));
        select_newModi.find('option').remove();
        var parentForModis = '_root';
        //$.log('parent_id', parent_id, 'hasChildren', hasChildren);
        if (parent_id && (! hasChildren)) {
            parentForModis = parent_modi;
        }
        //$.log('parent for modis', parentForModis);
        for (var i=0; i < posModi[parentForModis].length; i++) {
            select_newModi.append(
                $('<option>', {
                    value: posModi[parentForModis][i].id,
                    selected: (posModi[parentForModis][i].active ? 'selected' : null)
                }).text(posModi[parentForModis][i].name + ' (' + posModi[parentForModis][i].id + ')')
            );
        }
    }

    // if the doc has no children, or is new, one may move it to another modi of the same modt
    if (doc._id) {
        app.db.view("datamanager/sons", {
            key : doc._id,
            cache : JSON.stringify(new Date().getTime()),
            success: function(sons) {
                hasChildren = (sons.rows.length > 0) ? true : false;
                setAutocompleteAndModis();
            },
            error: function(e) {
                setAutocompleteAndModis();
            }
        });
    } else { // new doc
        hasChildren = false;
        setAutocompleteAndModis();
    }

    // Google map needs resize , if not did Google map comes partially, grey area comes instead of images 
    // from google server.
    if (typeof google === 'object' && typeof google.maps === 'object') {
        for (var key in app.data) {
            var infos = app.data[key];
            if (infos && infos.map) {
                var map = infos.map;
                google.maps.event.trigger(map, 'resize');
                map.setCenter(infos.marker.position);
            }
        }
    }
    

    // essai de modales retaillables
    /*$('.modal').resizable();
    $('.modal').on('resize', function(event, ui) {
        ui.element.css('margin-left', -ui.size.width/2);
        ui.element.css('margin-top', -ui.size.height/2);
        ui.element.css('top', '50%');
        ui.element.css('left', '50%');
        ui.element.css('height', ui.size.height + $('.modal-footer').outerHeight());
        $(ui.element).find('.modal-body').each(function() {
            $(this).css('max-height', ui.size.height - $('.modal-header').outerHeight() - $('.modal-footer').outerHeight());
        });
    });*/
};