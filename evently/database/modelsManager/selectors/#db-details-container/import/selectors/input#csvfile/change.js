function() {

    var app = $$(this).app,
        importLib = app.getlib('import'),
        sep = $('#sep').val(),
        enc = $('#enc').val();

    sep = sep.trim()[0];

    if (!sep) {
        sep = ',';
    }

    function process_text(e) {
        var csv = e.target.result,
            csvData = importLib.CSVToArray(csv, sep);

        if (csvData.length > 0) {
            var cols = csvData[0];
            app.data.cols = cols;
            app.data.csv = csvData;

            $("div#import-cols").trigger("_init");
        }
    }

    var file = this.files[0],
        fr = new FileReader();

    fr.onload = process_text;
    if (file) {
        fr.readAsText(file, enc);
    }
}