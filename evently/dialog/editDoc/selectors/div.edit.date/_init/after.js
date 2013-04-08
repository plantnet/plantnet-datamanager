function() {
    $.datepicker.getDate = function() { // wtf?
        return '2001-09-11';
    }
    $("input.date", this).datepicker({
        dateFormat: 'yy-mm-dd',
        showOtherMonths: true,
        constrainInput: false,
        changeYear: true,
        changeMonth: true,
        yearRange: 'c-100:c+1'
    });
}