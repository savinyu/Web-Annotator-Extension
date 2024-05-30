// background.js

chrome.runtime.onInstalled.addListener(() => {
    // Initialize storage with an empty annotations array
    chrome.storage.local.set({ annotations: [] }, () => {
        console.log('Annotations storage initialized.');
    });

    // Add context menu item for highlighting text
    chrome.contextMenus.create({
        id: 'addAnnotation',
        title: 'Add Annotation',
        contexts: ['selection']
    });
});

// Listen for the context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'addAnnotation') {
        const selectedText = info.selectionText;
        if (selectedText) {
            chrome.tabs.executeScript(tab.id, {
                code: `prompt("Enter your note:")`
            }, (results) => {
                const note = results[0];
                if (note) {
                    chrome.storage.local.get({ annotations: [] }, (result) => {
                        const annotations = result.annotations;
                        annotations.push({ text: selectedText, note: note });
                        chrome.storage.local.set({ annotations: annotations }, () => {
                            chrome.tabs.sendMessage(tab.id, { action: 'updateAnnotations', annotations: annotations });
                            alert('Annotation saved!');
                        });
                    });
                }
            });
        }
    }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getAnnotations') {
        chrome.storage.local.get({ annotations: [] }, (result) => {
            sendResponse({ annotations: result.annotations });
        });
        return true; // Indicates that the response is sent asynchronously
    }
});
