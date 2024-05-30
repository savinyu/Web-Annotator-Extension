

// Function to create the annotation UI
function createAnnotationUI() {
    const annotationContainer = document.createElement('div');
    annotationContainer.id = 'annotation-container';
    annotationContainer.style.position = 'fixed';
    annotationContainer.style.top = '10px';
    annotationContainer.style.right = '10px';
    annotationContainer.style.backgroundColor = '#1e1e1e'; // Dark background
    annotationContainer.style.border = '1px solid #6a0dad'; // Purple border
    annotationContainer.style.padding = '10px';
    annotationContainer.style.zIndex = '1000';
    annotationContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)'; // Shadow for better visibility
    annotationContainer.style.width = '300px';
    annotationContainer.style.maxHeight = '400px';
    annotationContainer.style.overflowY = 'auto';
    annotationContainer.style.color = '#ffffff'; // White text
    annotationContainer.style.fontFamily = 'Arial, sans-serif';

    const annotationList = document.createElement('div');
    annotationList.id = 'annotation-list';
    annotationContainer.appendChild(annotationList);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.onclick = () => {
        annotationContainer.style.display = 'none';
    };
    annotationContainer.appendChild(closeButton);

    document.body.appendChild(annotationContainer);
}

// Function to render annotations in the UI
function renderAnnotations(annotations) {
    const annotationList = document.getElementById('annotation-list');
    annotationList.innerHTML = '';
    if (annotations.length === 0) {
        annotationList.innerHTML = '<p>No annotations yet.</p>';
    } else {
        annotations.forEach((annotation, index) => {
            const annotationItem = document.createElement('div');
            annotationItem.style.borderBottom = '1px solid #6a0dad'; // Purple separator
            annotationItem.style.padding = '5px 0';

            const annotationText = document.createElement('span');
            annotationText.textContent = `${annotation.text}: ${annotation.note}`;
            annotationText.style.display = 'block';
            annotationText.style.cursor = 'pointer';
            annotationText.onclick = () => {
                highlightText(annotation.startContainerXPath, annotation.startOffset, annotation.endContainerXPath, annotation.endOffset);
            };

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.style.marginTop = '5px';
            deleteButton.style.backgroundColor = '#6a0dad'; // Purple button
            deleteButton.style.border = 'none';
            deleteButton.style.color = 'white';
            deleteButton.style.padding = '5px 10px';
            deleteButton.style.cursor = 'pointer';
            deleteButton.style.fontSize = '0.9em';
            deleteButton.style.borderRadius = '5px';
            deleteButton.onclick = () => {
                deleteAnnotation(index);
            };

            annotationItem.appendChild(annotationText);
            annotationItem.appendChild(deleteButton);
            annotationList.appendChild(annotationItem);
        });
    }
}

// Function to delete an annotation
function deleteAnnotation(index) {
    const url = window.location.href;
    chrome.storage.local.get({ annotations: {} }, function (result) {
        const annotations = result.annotations[url] || [];
        annotations.splice(index, 1);
        chrome.storage.local.set({ annotations: { ...result.annotations, [url]: annotations } }, function () {
            renderAnnotations(annotations);
        });
    });
}

// Function to handle text selection and annotation
function handleTextSelection() {
    document.addEventListener('mouseup', function () {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            if (selectedText.length > 0) {
                const note = prompt('Enter your note:');
                if (note) {
                    const startContainerXPath = getXPathForElement(range.startContainer);
                    const endContainerXPath = getXPathForElement(range.endContainer);
                    const startOffset = range.startOffset;
                    const endOffset = range.endOffset;
                    const url = window.location.href;

                    chrome.storage.local.get({ annotations: {} }, function (result) {
                        const annotations = result.annotations[url] || [];
                        annotations.push({ text: selectedText, note: note, startContainerXPath: startContainerXPath, startOffset: startOffset, endContainerXPath: endContainerXPath, endOffset: endOffset });
                        chrome.storage.local.set({ annotations: { ...result.annotations, [url]: annotations } }, function () {
                            renderAnnotations(annotations);
                        });
                    });
                }
            }
        }
    });
}

// Function to highlight the text on the page
function highlightText(startContainerXPath, startOffset, endContainerXPath, endOffset) {
    const startContainer = getElementByXPath(startContainerXPath);
    const endContainer = getElementByXPath(endContainerXPath);
    if (startContainer && endContainer) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(startContainer, startOffset);
        range.setEnd(endContainer, endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

// Helper function to get the XPath of an element
function getXPathForElement(element) {
    const idx = (sib, name) => sib
        ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
        ? [`id("${elm.id}")`]
        : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/');
}

// Helper function to get an element by its XPath
function getElementByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Initialize the content script
function init() {
    createAnnotationUI();
    const url = window.location.href;
    chrome.storage.local.get({ annotations: {} }, function (result) {
        const annotations = result.annotations[url] || [];
        renderAnnotations(annotations);
    });
    handleTextSelection();
}

// Run the initialization
init();
