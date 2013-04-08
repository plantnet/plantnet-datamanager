function() {
    var showSignup = $(this).data('show-signup');
    return {
        loc: window.location,
        show_signup: showSignup
    };
};