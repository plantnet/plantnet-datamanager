function (head, req) {

    // "smart" autocomplete

    var q = req.query.q;

    start({
    "headers": {
        "Content-Type": "text/plain; charset=utf-8",
        "Pragma": "no-cache", 
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0, public",
            "Expires": "0"
        }
    });

    var row,
        ret = {
            total_rows: 0,
            offset: 0,
            rows: []
        };

    var pattern = '^.*' + String.replace(q, / /g, '.+') + '.*$',
        re = new RegExp(pattern, 'i');

    while (row = getRow()) {
        if (re.test(row.key)) {
            ret.rows.push(row);
            ret.total_rows ++;
        } else {
            ret.offset++;
        }
    }

    send(JSON.stringify(ret));
}