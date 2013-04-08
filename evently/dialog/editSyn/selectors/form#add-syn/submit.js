function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        synid = $("#new-syn-id", this).val(),
        synlabel = $("#new-syn", this).val(),
        docid = $(this).attr("docid-data");

        $.log(synid, docid);
    if(!synid || docid == synid) {
        alert("invalid data");
        return false;
    }

    function onSuccess() {
        $('#edit-syn-modal').modal("hide");
        $("#dialog-bloc").trigger("editSyn", [docid, app.data.trigger]);
        utilsLib.showSuccess('Synonym added');
    }

    function onError (e,a,b,c) {
        utilsLib.showError(e);
    }

    app.db.view("datamanager/synonym", {
        cache : JSON.stringify(new Date().getTime()),
        key : synid,
        reduce : false,
        success : function(syndata) {
            if(syndata.rows.length > 1) {
                var answer = confirm(synlabel + " already has synonyms! " + 
                  "This operation will update them.");
                if(!answer) {
                    return;
                }
            }

            var synids = syndata.rows.map(function (e) {
                return e.id;
            });
            synids.push(synid);
            synids = synids.unique();

            var doclib = app.getlib("doc");
            doclib.set_active_synonym(app.db, docid, synids, onSuccess, onError);
        }
    });

    return false;
}