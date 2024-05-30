

// Function to create the annotation UI
function createAnnotationUI() {
    const annotationContainer = document.createElement('div');
    annotationContainer.id = 'annotation-container';
    const annotationList = document.createElement('div');
    annotationList.id = 'annotation-list';
    annotationContainer.appendChild(annotationList);

    const closeButton = document.createElement('button');
    closeButton.className = "close-button";
    closeButton.textContent = 'Close';
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
            annotationItem.id = "item";

            const annotationText = document.createElement('span');
            annotationText.textContent = `${annotation.text}: ${annotation.note}`;
            annotationText.style.display = 'block';
            annotationText.style.cursor = 'pointer';
            annotationText.onclick = () => {
                highlightText(annotation);
            };

            const deleteButton = document.createElement('button');
            deleteButton.className="delete-button";
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                deleteAnnotation(index);
            };

            annotationItem.appendChild(annotationText);
            annotationItem.appendChild(deleteButton);
            annotationList.appendChild(annotationItem);
        });
    }

    annotations.forEach(annotation => highlightText(annotation));
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
                            highlightText({ startContainerXPath, startOffset, endContainerXPath, endOffset });
                        });
                    });
                }
            }
        }
    });
}

// Function to highlight the text on the page
function highlightText(annotation) {
    const startContainer = getElementByXPath(annotation.startContainerXPath);
    const endContainer = getElementByXPath(annotation.endContainerXPath);
    if (startContainer && endContainer) {
        const range = document.createRange();
        range.setStart(startContainer, annotation.startOffset);
        range.setEnd(endContainer, annotation.endOffset);

        const span = document.createElement('span');
        span.className = 'highlighted-annotation';
        range.surroundContents(span);
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


init();
