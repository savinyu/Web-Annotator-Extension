chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ANNOTATION_MODE' });
  });
  