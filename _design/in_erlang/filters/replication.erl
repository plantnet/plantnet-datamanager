fun({Doc}, {Req}) ->

    % If Req.ids is set, all docs whose id is set as a key of Req.ids will be replicated
    % If Req.Structures is set, for any "DM structure doc" whose id is set as a key in Req.Structures,
    %     if an object is set as the value then if its "data" property is set, all data docs from this
    %     structure will be replicated and if a doc type is set as a property ("query" or "view") then
    %     all docs of this type from this structure will be replicated
    % If Query.Types is set, all docs of any type set as a key of Query.Types will be replicated ("view", "query", "selection"...)

    Log("coucou"),

    {Query} = proplists:get_value(<<"query">>, Req),
    % Log(Query),
    FilterIds = proplists:get_value(<<"ids">>, Query),
    FilterStructures = proplists:get_value(<<"structures">>, Query),
    FilterTypes = proplists:get_value(<<"types">>, Query),

    % Log(lists:flatten(io_lib:format("FilterIds: ~s , FilterStructures: ~s , FilterTypes: ~s .", [FilterIds, FilterStructures, FilterTypes]))),

    if
        FilterIds /= undefined ->
            {[FilterIdsObject]} = FilterIds,
            DocHasId = proplists:is_defined(couch_util:get_value(<<"_id">>, Doc), FilterIdsObject);
        true ->
            DocHasId = false
    end,
    if
        FilterTypes /= undefined ->
            {[FilterTypesObject]} = FilterTypes,
            DocTypeInTypes = proplists:is_defined(couch_util:get_value(<<"$type">>, Doc), FilterTypesObject);
        true ->
            DocTypeInTypes = false
    end,
    if
        FilterStructures /= undefined ->
            Log("tralala"),
            {[FilterStructuresObject]} = FilterStructures,
            Log("pouet pouet"),
            DocHasMm = proplists:is_defined(<<"$mm">>, Doc),
            Log("youpi"),
            if
                DocHasMm ->
                    Log("dokememinstruct 1"),
                    DocMmPl = proplists:get_value(<<"$mm">>, Doc),
                    Log(DocMmPl),
                    Log("dokememinstruct 2"),
                    DocMm = couch_util:get_value(<<"$mm">>, Doc),
                    Log(DocMm),
                    Log("dokememinstruct 3"),
                    DocMmInStructures = proplists:is_defined(DocMm, FilterStructuresObject),
                    Log("dokememinstruct 4"),
                    if
                        DocMmInStructures ->
                            Log("docaztype 1"),
                            DocHasType = proplists:is_defined(<<"$type">>, Doc),
                            Log("docaztype 2"),
                            if
                                DocHasType ->
                                    Log("cp1"),
                                    DocTypeInStructure = proplists:is_defined(couch_util:get_value(<<"$type">>, Doc), proplists:get_value(couch_util:get_value(<<"$mm">>, Doc), FilterStructures)),
                                    Log("cp3"),
                                    DataRequired = false;
                                true ->
                                    Log("cp2"),
                                    DataRequired = proplists:is_defined(<<"data">>, proplists:get_value(couch_util:get_value(<<"$mm">>, Doc), FilterStructures)),
                                    Log("cp4"),
                                    DocTypeInStructure = false
                            end;
                        true ->
                            DocTypeInStructure = false,
                            DataRequired = false
                    end;
                true ->
                    DocTypeInStructure = false,
                    DataRequired = false
            end;
        true ->
            DocTypeInStructure = false,
            DataRequired = false
    end,
    if
        DocHasId -> true;
        DocTypeInTypes -> true;
        DocTypeInStructure -> true;
        DataRequired -> true;
        true -> false
    end
end.