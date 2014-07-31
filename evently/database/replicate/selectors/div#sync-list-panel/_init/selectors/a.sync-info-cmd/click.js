function(e) {
    var syncInfo = {
            checkpointed_source_seq: $(this).data('css'),
            docs_read: $(this).data('dr'),
            docs_written: $(this).data('dw'),
            missing_revisions_found: $(this).data('mrf'),
            revisions_checked: $(this).data('rc'),
            doc_write_failures: $(this).data('dwf'),
            replication_state: $(this).data('rs'),
            replication_state_time: $(this).data('rst'),
            source: $(this).data('source'),
            target: $(this).data('target'),
            continuous: $(this).data('continuous'),
            owner: $(this).data('owner'),
            what: $(this).data('what'),
            includedeleted: $(this).data('includedeleted')
        };

    syncInfo.all = (syncInfo.what.mode == 'all');
    syncInfo.structures = (syncInfo.what.mode == 'advanced');
    syncInfo.queries = (syncInfo.what.mode == 'queries');
    syncInfo.selections = (syncInfo.what.mode == 'selections');

    $('#dialog-bloc').trigger('syncInfo', syncInfo);

    return false;
}