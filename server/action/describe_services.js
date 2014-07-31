// List of available services, upon HTTP OPTIONS request.
// Keep this up to date!
// see http://amap-dev.cirad.fr/projects/p2pnote/wiki/Webservices_description_format

q.send_options({
    methods: [
        'bulk_edit',
        'check_data',
        'copy_mm_data',
        'dump.get',
        'execute_query',
        'generate_test_data',
        'get_features',
        'get_selection_contents',
        'get_selections',
        'get_structures',
        'get_views_queries',
        'match_ref_mm',
        'purge_structure_docs',
        'rebuild_path',
        'resolve_all_conflict',
        'resolve_all_conflict_by_date',
        'save_doc',
        'test',
        'up_changes',
        'update_mm',
        'update_ref_mm',
        'update_views',
        'view'
    ]
});