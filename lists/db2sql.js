/**
 * Converts a database into a set of SQL instructions. Roughly:
 *  modi in mms produce "create table" instructions,
 *  modt in mms produce "create view" instructions,
 *  regular docs produce "insert into" instructions
 *  
 *  2012-09-28: built for MySQL - add an option for PgSQL? Standardizing is tough! (quotes, comments...)
 */
function (head, req) {

    var filename = req.query.fn || "datamanager_export.sql",
        mmids = req.query.mmids.split(','),
        fkmod = (req.query.fkmod == 'true'),
        fkref = (req.query.fkref == 'true'),
        fieldprops = (req.query.fieldprops == 'true'),
        target = req.query.target,
        libutils = require('vendor/datamanager/lib/utils');

    start({
        "headers": {
            "Content-Type": "application/force-download",
            "Content-disposition": "attachment; filename=" + filename,
            "Pragma": "no-cache", 
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0, public",
            "Expires": "0"
        }
    });

    // returns SQL equivalent of DataManager's type t
    function getType(t) {

        switch(t) {
            case 'text': return 'varchar(255)';
            case 'longtext': return 'text';
            case 'integer': return 'integer';
            case 'boolean': return 'boolean';
            case 'float': return 'real';
            case 'date': return 'date';
            case 'time': return 'time';
            case 'url': return 'varchar(255)';
            case 'geoloc': return 'varchar(255)';
            case 'enum': return 'varchar(255)'; // MySQL:enum PgSQL:?
            case 'multi-enum': return 'varchar(255)'; // ?
            case 'range': return 'real';
            case 'ref': return 'varchar(255)';
            default: return 'varchar(255)';
        }
    }

    // escapes single quotes by doubling them
    function escape(val) {

        return String.replace(val, /'/gi, "''");
    }

    // quotes tables/columns identifiers, depending on the target DBMS
    function quote(val) {

        if (target == 'mysql') {
            return '`' + val + '`';
        }
        if (target == 'postgresql') {
            return '"' + val + '"';
        }
        return val;
    }

    // returns value v formatted for insertion in DBMS, depending on type t
    function getVal(v, t) {

        var val = (v ? v : null);
        if (val != null) {
            if (t == 'real' || t == 'integer') {
                val = String(val);
            } else if (t == 'boolean') {
                val = (val ? 'true' : 'false'); // beware of "checked" value
            } else {
                val = "'" + escape(val) + "'";
            }
        }
        return (val ? val : null);
    }

    // normalizes name n to make it SQL safe (no white spaces, lower case, no special chars)
    function normalizeName(n) {
        return libutils.no_accent(n.toLowerCase());
        // return n.toLowerCase().replace(' ', '_');
    }

    // converts a mm doc into one "create table" per modi, and returns the SQL-compliant schema
    function createTables(doc) {

        send('-- creating tables for model (' + doc.name + ')\n');
        var sqlModel = {
            name: normalizeName(doc.name),
            desc: doc.desc, // TODO escape single quotes
            modules: {},
            structure: {},
            serial: 0 // manual PK int id
        };
        for (var mt in doc.modules) { // copy & normalize modules
            var modt = doc.modules[mt];
            sqlModel.modules[mt] = {
                name: normalizeName(modt.name),
                desc: modt.desc,
                attachments: modt.withimg || modt.withattchs,
                fields: []
            };
            for (var i=0; i < modt.fields.length; i++) {
                var f = modt.fields[i];
                sqlModel.modules[mt].fields.push({
                    name: (f.label ? normalizeName(f.label) : normalizeName(f.name)), // f.name should already be normalized
                    realName: f.name,
                    type: getType(f.type),
                    desc: f.desc,
                    mandatory: f.mandatory,
                    unique: (f.uniq ? true : false),
                    defaultValue: f.default_value,
                    target: ((f.type == 'ref') ? f.mm : null)
                });
            }
        }
        for (var m in doc.structure) { // one table per modi, store normalized structure in sqlModel
            var modi = doc.structure[m];
                module = sqlModel.modules[modi[0]];
                inst = '',
                title = module.name + m;
            if ((modi.length > 3) && (modi[3])) {
                title = modi[3];
            }
            sqlModel.structure[m] = {
                tableName: sqlModel.name + '.' + normalizeName(title),
                title: ((modi.length > 3) && (modi[3])) ? modi[3] : null,
                module: modi[0],
                parent: modi[1]
            };
            var comments = []; // for postgresql
            inst += 'CREATE TABLE ' + quote(sqlModel.structure[m].tableName) + ' (';
            inst += quote('_id') + ' integer PRIMARY KEY, ' + quote('_parent') + ' integer, ';
            for (var f=0; f <  module.fields.length; f++) {
                var field = module.fields[f];
                inst += quote(field.name) + ' ' + field.type;
                if (field.desc && target == 'mysql') {
                    inst += " COMMENT '" + escape(field.desc) + "'";
                }
                if (field.desc && target == 'postgresql') {
                    comments.push(
                        'COMMENT ON COLUMN ' + quote(sqlModel.structure[m].tableName)
                        + '.' + quote(field.name)
                        + " IS '" + escape(field.desc) + "';"
                    );
                }
                if (f < module.fields.length - 1) {
                    inst += ', ';
                }
            }
            inst += ')';

            if (module.desc && target == 'mysql') {
                inst += " COMMENT='" + escape(module.desc) + "'";
            }
            inst += ';\n';
            if (module.desc && target == 'postgresql') {
                inst += 'COMMENT ON TABLE ' + quote(sqlModel.structure[m].tableName)
                    + " IS '" + escape(module.desc) + "';\n";
                for (var i=0; i < comments.length; i++) {
                    inst += comments[i] + '\n';
                }
            }
            send(inst);
        }
        send('\n');
        return sqlModel;
    }

    // converts a mm doc into one "create view" per modt
    function createViews(mm) {

        var modelsByModule = {};
        for (var m in mm.structure) {
            var model = mm.structure[m];
            if (! (model.module in modelsByModule)) {
                modelsByModule[model.module] = {
                    name: mm.modules[model.module].name,
                    instances: []
                };
            }
            modelsByModule[model.module].instances.push(model.tableName);
        }
        for (var m in modelsByModule) {
            var mbm = modelsByModule[m];
            send('-- view for all instances of module (' + mbm.name + ') in model (' + mm.name + ')\n');
            var inst = 'CREATE VIEW ' + quote(mm.name + '.' + mbm.name) + ' AS ';
            for (var i=0; i < mbm.instances.length; i++) {
                inst += 'SELECT * FROM ' + quote(mbm.instances[i]);
                if (i < mbm.instances.length - 1) {
                    inst += ' UNION ';
                }
            }
            // inst += " COMMENT='view for all instances of module (" + mbm.name + ") in model (" + mm.name + ")'";
            inst += ';\n';
            if (target == 'postgresql') {
                inst += 'COMMENT ON VIEW ' + quote(mm.name + '.' + mbm.name)
                + " IS 'view for all instances of module (" + mbm.name + ") in model (" + mm.name + ")';\n";
            }
            send(inst);
        }
        send('\n');
    }

    function insertInto(doc, mm, storedIds) {

        var modt = mm.modules[doc.$modt],
            modi = mm.structure[doc.$modi];
        var inst = 'INSERT INTO ' + quote(modi.tableName),
            fields = quote('_id') + ', ' + quote('_parent') + ', ',
            values = '' + mm.serial + ', ';
        // try to get parent id
        var parentId = String.substring(doc._id, 0, String.lastIndexOf(doc._id, '##')),
            sqlParentId = (storedIds[parentId] ? storedIds[parentId] : 'null');
        values += '' + sqlParentId + ', ';
        for (var i=0; i < modt.fields.length; i++) {
            var f = modt.fields[i];
            fields += quote(f.name);
            values += getVal(doc[f.realName], f.type);
            if (i < modt.fields.length - 1) {
                fields += ', ';
                values += ', ';
            }
        }
        inst += ' (' + fields + ') VALUES (' + values + ')';
        inst += ';\n';
        send(inst);
        storedIds[doc._id] = mm.serial;
        mm.serial++;
    }

    // produces the beginning of an INSERT statement, specifying columns
    function insertColumns(doc, mm) {

        var modt = mm.modules[doc.$modt],
            modi = mm.structure[doc.$modi];
        var inst = 'INSERT INTO ' + quote(modi.tableName),
            fields = quote('_id') + ', ' + quote('_parent') + ', ';

        for (var i=0; i < modt.fields.length; i++) {
            var f = modt.fields[i];
            fields += quote(f.name);
            if (i < modt.fields.length - 1) {
                fields += ', ';
            }
        }
        inst += ' (' + fields + ') VALUES ';

        return inst;
    }

    function bulkInsert(doc, mm, storedIds) {

        var modt = mm.modules[doc.$modt],
            inst = '(' + mm.serial + ', ';
        // try to get parent id
        var parentId = String.substring(doc._id, 0, String.lastIndexOf(doc._id, '##')),
            sqlParentId = (storedIds[parentId] ? storedIds[parentId] : 'null');

        inst += '' + sqlParentId + ', ';
        for (var i=0; i < modt.fields.length; i++) {
            var f = modt.fields[i];
            inst += getVal(doc[f.realName], f.type);
            if (i < modt.fields.length - 1) {
                inst += ', ';
            }
        }
        inst += ')';
        storedIds[doc._id] = mm.serial;
        mm.serial++;

        return inst;
    }

    // produces an "add constraint foreign key" to reflect modules structure in a mm
    function setFkOnModules(mms) {

        send('\n-- definition of foreign keys for model structure\n');
        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m];
                if (modi.parent) {
                    var parentModi = model.structure[modi.parent],
                        inst = 'ALTER TABLE ' + quote(modi.tableName);
                    inst += ' ADD CONSTRAINT ' + quote(m + '_parentFk'); // beware of too long identifiers causing errors!
                    inst += ' FOREIGN KEY (' + quote('_parent') + ') REFERENCES '
                            + quote(parentModi.tableName) + ' (' + quote('_id') + ')';
                    inst += ' ON UPDATE CASCADE ON DELETE SET NULL'; // optional
                    inst += ';\n';
                    send(inst);
                }
            }
        }
    }

    // @TODO produces an "add constraint foreign key" for each "reference" typed field
    function setFkOnReferenceFields(mms) {

        send('\n-- definition of foreign keys for reference fields\n');
        return false;

        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m],
                    modt = model.modules[modi.module],
                    inst = 'ALTER TABLE ' + quote(modi.tableName);
                for (var i=0; i < modt.fields.length; i++) {
                    var f = modt.fields[i];
                    if (f.type == "ref") {
                        var target = f.target;
                        if (target) {
                            // ??
                        }
                    }
                }
            }
        }
    }

    // adds "unique", "not null" and "default" constraints/properties on each field
    function setFieldsProperties(mms) {

        send('\n-- definition of field properties (unique, not null, default value)\n');
        for (var mm in mms) {
            var model = mms[mm].sql;
            for (var m in model.structure) {
                var modi = model.structure[m],
                    modt = model.modules[modi.module],
                    uniqueFields = [],
                    inst = 'ALTER TABLE ' + quote(modi.tableName);
                for (var i=0; i < modt.fields.length; i++) {
                    var f = modt.fields[i];
                    if (f.unique) {
                        uniqueFields.push(f.name);
                    }
                    if (f.mandatory) { // mandatory
                        if (target == 'mysql') {
                            send(inst + ' MODIFY ' + quote(f.name) + ' ' + f.type + ' NOT NULL;\n');
                        }
                        if (target == 'postgresql') {
                            send(inst + ' ALTER COLUMN ' + quote(f.name) + ' SET NOT NULL;\n');
                        }
                    }
                    if (f.defaultValue && f.type != 'text') { // default value, forbidden for text/blob
                        if (target == 'mysql') {
                            send(inst + ' MODIFY ' + quote(f.name) + ' ' + f.type + ' DEFAULT '
                                    + getVal(f.defaultValue, f.type) + ';\n');
                        }
                        if (target == 'postgresql') {
                            send(inst + ' ALTER COLUMN ' + quote(f.name) + ' ' + ' SET DEFAULT '
                                    + getVal(f.defaultValue, f.type) + ';\n');
                        }
                    }
                }
                // unique constraint
                if (uniqueFields.length) {
                    inst += ' ADD CONSTRAINT ' + quote(m + '_unique') + ' '; // beware of too long identifiers causing errors!
                    inst += 'UNIQUE (';
                    for (var i=0; i < uniqueFields.length; i++) {
                        inst += quote(uniqueFields[i]);
                        if (i < uniqueFields.length - 1) {
                            inst += ', ';
                        }
                    }
                    inst += ');\n';
                    send(inst);
                }
            }
        }
    }

    // main
    var mms = {},
        row,
        storedIds = {},
        //bulkInsertStmt = '',
        lastModel = null;

    if (target == 'postgresql') {
        send('SET datestyle = "ISO, YMD";\n');
    }
    while ((row = getRow())) {
        if (row.key[1] == 0) { // mm
            if ((mmids[0] == 'null') || (mmids.indexOf(row.id) > -1)) {
                mms[row.id] = {
                    doc: row.doc
                };
                var sqlModel = createTables(row.doc);
                mms[row.id].sql = sqlModel;
                createViews(mms[row.id].sql);
            }
        } else { // data doc
            if ((mmids[0] == 'null') || (mmids.indexOf(row.doc.$mm) > -1)) { // exclude docs from models not selected
                var mm = mms[row.doc.$mm];
                if (mm == undefined) {
                    //log('unknown mm:[' + row.doc.$mm + ']');
                } else {
                    if (lastModel != row.doc.$mm) { // needs to detect modi change to use bulk insert
                        /*if (bulkInsertStmt) {
                            bulkInsertStmt = bulkInsertStmt.substring(0, bulkInsertStmt.length - 2); // remove last ', '
                            send(bulkInsertStmt + ';');
                        }*/
                        send('\n-- inserting data for model (' + mm.doc.name + ')\n');
                        lastModel = row.doc.$mm;
                        storedIds = {};
                        //bulkInsertStmt = insertColumns(row.doc, mm.sql);
                    }
                    insertInto(row.doc, mm.sql, storedIds);
                    //bulkInsertStmt += bulkInsert(row.doc, mm.sql, storedIds) + ', ';
                }
            }
        }
    }
    // last insert
    /*if (bulkInsertStmt) {
        bulkInsertStmt = bulkInsertStmt.substring(0, bulkInsertStmt.length - 2); // remove last ', '
        send(bulkInsertStmt + ';');
    }*/

    // set constraints ?
    if (fkmod) {
        setFkOnModules(mms);
    }
    if (fkref) {
        setFkOnReferenceFields(mms);
    }
    if (fieldprops) {
        setFieldsProperties(mms);
    }

    send('\n-- export completed');
}