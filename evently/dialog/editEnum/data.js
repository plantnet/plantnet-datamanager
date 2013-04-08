function(e, values, origin) {

    try {
        values = JSON.parse(values);
        values = values.join("\n");
    }
    catch (Exception) {
        values = '';
    }

    return {
        values: values
    };
}