function(e, mmId, idsList) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        docLib = app.getlib('doc'),
        cacheLib = app.getlib('cache'),
        bnds = app.data.map.getBounds(),
        bbox = [bnds.getSouthWest().lng(), bnds.getSouthWest().lat(),
                bnds.getNorthEast().lng(), bnds.getNorthEast().lat()];

    utilsLib.hideBusyMsg('map'); // remove "loading map view" message
    utilsLib.showBusyMsg('Displaying points on map.', 'map');

    var layersFilter = app.layersFilter,
        d,
        co,
        modi,
        field,
        pos;

    // global for markers, to clear them
    app.markers = app.markers || [];

    if (idsList) { // à l'ancienne
        app.db.allDocs({
            keys: idsList,
            include_docs: true,
            success: function(data) {
                //$.log('data reçues', data);
                clearMarkers();
                // get all geoloc fields for the current doc
                var row,
                    structure,
                    field,
                    modt,
                    fieldNamesCache = {};
                for (var i=0; i < data.rows.length; i++) {
                    row = data.rows[i];
                    if ((! row.doc.$mm) || (! row.doc.$modi)) {
                        continue;
                    }
                    // fill the cache with all fieldnames having the 'geoloc' type
                    if (! (row.doc.$mm in fieldNamesCache)) {
                        fieldNamesCache[row.doc.$mm] = {};
                        modt = '' + row.doc.$modt;
                        // get cached structure
                        structure = cacheLib.get_cached_mm(app, row.doc.$mm);
                        //$.log('cached struct', structure);
                        fieldNamesCache[row.doc.$mm][modt] = [];
                        // find geoloc fields
                        for (var j=0; j < structure.modules[modt].fields.length; j++) {
                            field = structure.modules[modt].fields[j];
                            if (field.type == 'geoloc') {
                                //$.log('geoloc field', field.name, 'fnc', fieldNamesCache[row.doc.$mm], 'rdmt', modt);
                                fieldNamesCache[row.doc.$mm][modt].push(field.name);
                            }
                        }
                    }
                    // get the data
                    var fieldName,
                        value,
                        pos;
                    for (var k=0; k < fieldNamesCache[row.doc.$mm][modt].length; k++) {
                        fieldName = fieldNamesCache[row.doc.$mm][modt][k];
                        value = row.doc[fieldName];
                        // add a marker on the map
                        pos = new google.maps.LatLng(value[1], value[0]);
                        //$.log('found geoloc field', fieldName, value);
                        addMarker(pos, [], row);
                    }
                }
                utilsLib.hideBusyMsg('map');
                $("#geoloc-list").trigger("list_point", [idsList]);
            },
            error: function() {
                utilsLib.showError('Error displaying points');
                utilsLib.hideBusyMsg('map');
            }
        });
    } else { // geocouch
        $.getJSON(app.db.uri + mmId + '/_spatial/points?plane_bounds=-180,-90,180,90&bbox=' + bbox, 
            function(data) {
                clearMarkers();
                //$.log('spatial data', data);
                var ids = [];
                for (var i = 0, l = data.rows.length; i < l; i++) {
                    d = data.rows[i],
                    co = d.geometry.coordinates,
                    modi = d.value.modi,
                    field = d.value.field,
                    pos = new google.maps.LatLng(co[1], co[0]);
    
                    if (layersFilter && modi && field) { // process filter
                        var filter;
                        for (j in layersFilter) {
                            filter = layersFilter[j];
                            //$.log('checking filter', filter);
                            if (filter && (filter.modi == modi) && (filter.field == field)) {
                                addMarker(pos, ids, d);
                            }
                        }
                    } else {
                        addMarker(pos, ids, d);
                    }
                }
                $("#geoloc-list").trigger("list_point", [ids]);
                utilsLib.hideBusyMsg('map');
            });
    }

    // adds a marker at the given position
    function addMarker(pos, ids, d) {
        var marker = new google.maps.Marker({
                icon: 'img/map/point.png',
                position: pos,
                /*modi: modi,
                field: field,*/
                map: app.data.map
            });
        ids.push(d.id);
        app.markers.push(marker);
        google.maps.event.addListener(marker, 'click', (function(id, m) {
            return function() {
                info(id, m);
            };
        })(d.id, marker));
    }

    // create info popup for a marker
    function info(id, marker) {
        app.db.openDoc(id, {
            success: function(doc) {
                var content = docLib.to_html(doc, true, app),
                    infoWindow = new google.maps.InfoWindow({
                        content: content,
                        maxWidth: 200
                    });
                infoWindow.open(app.data.map, marker);
           }
       });
    }

    // remove all markers from the map
    function clearMarkers() {
        for (var i=0; i < app.markers.length; i++) {
            app.markers[i].setMap(null);
        }
        app.markers = [];
    }
}