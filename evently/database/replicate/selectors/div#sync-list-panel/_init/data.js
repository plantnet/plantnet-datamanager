function(e) {

    var outgoing = [{
        to: 'apg3 @ data',
        user: 'mchouet',
        date: '2013-04-09 11:31',
        progress: '27',
        mode: 'continuous'
    }];
    var incoming = [{
        from: 'mathias_test @ data',
        user: 'mchouet',
        date: '2013-04-09 17:44',
        progress: '90',
        mode: 'one-shot'
    }];

    return {
        outgoing: outgoing,
        incoming: incoming,
        hasOutgoing: outgoing.length,
        hasIncoming: incoming.length
    };
}