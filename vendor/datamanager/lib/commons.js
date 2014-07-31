// extend javascript object

// from http://www.shamasis.net/2009/09/fast-algorithm-to-find-unique-items-in-javascript-array/
Array.prototype.unique = function() {
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l; i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
};

// stages might be an array of properties to go through before reaching the field
Array.prototype.uniqueInObject = function(field, stages) {
    var o = {}, i, l = this.length, r = [], t;
    for(i = 0; i < l; i += 1) {
        t = this[i];
        if (stages) {
            for (var j=0; j < stages.length; j++) {
                t = t[stages[j]];
            }
        }
        t = t[field];
        o[t] = this[i];
    }
    for(i in o) r.push(o[i]);
    return r;
};

// asyncForEach
// fn : a function (elem, next_func)
// callback : final callback
Array.prototype.asyncForEach = function (fn, callback) {
  var array = this.slice(0);
  function processOne() {
    var item = array.pop();
    fn(item, function(result) {
        if(array.length > 0) {
          setTimeout(processOne, 0); // schedule immediately
        } else {
          callback(); // Done!
        }
      });
  }
  if(array.length > 0) {
    setTimeout(processOne, 0); // schedule immediately
  } else {
    callback(); // Done!
  }
};


// Last
Array.prototype.last = function () {
    if(this.length) {
        return this[this.length - 1];
    } else {
        return undefined;
    }
};


function dynamicSort(property) {
    return function (a,b) {
        return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    };
}

Array.prototype.sortBy = function (property) {
    return this.sort(dynamicSort(property));
};

// from http://stackoverflow.com/questions/280634/endswith-in-javascript
// added ignoreCase parameter
String.prototype.endsWith = function(suffix, ignoreCase) {
    if (ignoreCase === true) {
        return this.toLowerCase().indexOf(suffix.toLowerCase(), this.length - suffix.length) !== -1;
    } else {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    }
};

