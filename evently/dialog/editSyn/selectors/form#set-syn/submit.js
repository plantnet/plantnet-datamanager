function (e) {

    var app = $$(this).app,
        utilsLib = app.getlib('utils'),
        synid = $("#syn-of-id", this).val(),
        synlabel = $("#syn-of", this).val(),
        docid = $(this).attr("docid-data");

       
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
        $.log(e,a,b,c);
        utilsLib.showError(e + a + b + c);
    }

    app.db.openDoc(synid, {
       success : function(syn) {
           if(syn.$synonym) {
               synid = syn.$synonym;
           }
           if(synid == docid) {
             synid = "";
           } 
           app.db.update("datamanager/synonym", docid, { synid: synid }, onSuccess, onError);
       }
   });

    return false;
}