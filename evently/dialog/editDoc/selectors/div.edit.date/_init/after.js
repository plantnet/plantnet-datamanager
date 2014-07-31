function() {
    $('input.date', this).datepicker({
        dateFormat: 'yy-mm-dd',
        showOtherMonths: true,
        constrainInput: false,
        changeYear: true,
        changeMonth: true,
        yearRange: 'c-100:c+100'
    });

    $('input.date', this).on('blur', function() {
        var val = $(this).val();
        if (val && val.length == 4) { // if only the year was typed, complete with zeroes
            $(this).val(val + '-00-00');
        }
        if (val && val.length == 7) { // if only the year and month were typed, complete with zeroes
            $(this).val(val + '-00');
        }
    });

    $('#ui-datepicker-div').ready(function() {
        var popup = $('input.date', this).parent('div');
        var datePicker = $('#ui-datepicker-div');
        popup.append(datePicker);
    });
}