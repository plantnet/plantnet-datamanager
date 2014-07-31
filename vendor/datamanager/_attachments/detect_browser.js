var userAgent = navigator.userAgent.toLowerCase();

$('#dm-mode').text(getDmMode());

if (!isDevelMode() && !isBadBrowserPage() && !isAutorisedBrowser()) {
    window.location = 'bad_browser.html';
}
if (!isBadBrowserPage()) {
    if (isDevelMode() && !isAutorisedBrowser()) {
        $('#dm-mode-infos').show();
    } else {
        $('#dm-mode-infos').hide();
    }
} else {
    $('#dm-mode-infos').hide();
    if (isDevelMode()) {
        $('#root-line').show();
        $('#add-devel-mode-btn').hide();
        $('#del-devel-mode-btn').show();
    } else {
        $('#root-line').hide();
        $('#add-devel-mode-btn').show();
        $('#del-devel-mode-btn').hide();
    }
}
function isBadBrowserPage() {
    return (window.location.pathname.indexOf('bad_browser.html') > -1) ? true : false;
}

function isAutorisedBrowser() {
    return (userAgent.indexOf('chrome') > -1 || userAgent.indexOf('firefox') > -1);
}

function isDevelMode() {
    return (readCookie('dm-mode') == 'devel') ? true : false;
}

function addDevelMode() {
    createCookie('dm-mode', 'devel', 100);
    window.location = 'projects.html';
}

function getDmMode() {
    return readCookie('dm-mode');
}

function deleteDevelMode() {
    eraseCookie('dm-mode');
    window.location = 'projects.html';
}

function createCookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
    }
    document.cookie = name + '=' + value + expires + '; path=/';
}

function readCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, '', -1);
}
