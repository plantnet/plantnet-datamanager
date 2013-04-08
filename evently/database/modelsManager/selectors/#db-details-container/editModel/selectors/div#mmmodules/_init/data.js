function(activateTab) {
    var app = $$(this).app,
        mm = app.data.mm,
        modules = [],
        i=-1,
        j=0;

    for (var m in mm.modules) {
        var color;
        if (mm.modules[m].color) {
            color = mm.modules[m].color;
        } else {
            var numMod = parseInt(m);
            if (! isNaN(numMod)) {
                i = numMod;
            } else {
                i++;
            }
            color = app.config.colors[(i % app.config.colors.length)];
            mm.modules[m].color = color;
        }

        modules.push({
            _id : m,
            name: mm.modules[m].name,
            active: false,
            color: color
        });
        j++;
    }

    modules.sort(
        function(a,b) {
            a = mm.modules[a._id].order;
            b = mm.modules[b._id].order;
            return (a - b);
        });

    // activate specified module tab
    if (modules.length) {
        if (activateTab == 'last') {
            modules[modules.length - 1].active = true;
        } else if (activateTab !== false) {
            modules[activateTab].active = true;
        } else {
            modules[0].active = true;
        }
    }

    return {
        modules: modules
    };
};