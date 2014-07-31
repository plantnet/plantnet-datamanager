function(data) {
    var utilsLib = $$(this).app.getlib('utils'),
        tasks = [];
    for (var i = 0; i < data.length; i++) {
        var task = data[i];
        
        if (task.started_on) {
            var startedDate = new Date (task.started_on * 1000);
            task.started_on_time = startedDate.toLocaleTimeString();
            task.started_on_date = startedDate.toLocaleDateString();
        }
        if (task.updated_on) {
            var updatedDate = new Date (task.updated_on * 1000);
            task.updated_on_time = updatedDate.toLocaleTimeString();
            task.updated_on_date = updatedDate.toLocaleDateString();
        }
        if (task.started_on && task.updated_on) {
            var duration = parseInt(task.updated_on) - parseInt(task.started_on);
            //$.log('Duration : '+duration + '/' + utilsLib.secondsToString(duration));
            task.duration = utilsLib.secondsToString(duration);
        }
        task['is_' + task.type] = true;
        
        tasks.push(task);
    }
    //$.log(tasks);
    return {
        no_task: !!(data.length == 0),
        has_tasks: !!(data.length > 0),
        tasks: tasks
    };
}