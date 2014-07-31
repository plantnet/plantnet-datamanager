function () {
    // module up
    var activeTab = $('#model-editor-modules-tabs').find('li.active'),
        activeTabContents = $('#model-editor-modules').find('div.tab-pane.active');

    activeTab.insertBefore(activeTab.prev());
    activeTabContents.insertBefore(activeTabContents.prev());

    return false;
}