function () {
    // module down
    var activeTab = $('#model-editor-modules-tabs').find('li.active'),
        activeTabContents = $('#model-editor-modules').find('div.tab-pane.active');

    activeTab.insertAfter(activeTab.next());
    activeTabContents.insertAfter(activeTabContents.next());

    return false;
}