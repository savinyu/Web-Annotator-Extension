import React, { useState } from 'react';
import './App.css';

function Popup() {
  const [annotations, setAnnotations] = useState([]);
  const [text, setText] = useState('');

  const handleAddAnnotation = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'ADD_ANNOTATION', text });
    });
    setAnnotations([...annotations, text]);
    setText('');
  };
  

  return (
    <div className="App">
      <h1>Annotations</h1>
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your annotation..."
        />
        <button onClick={handleAddAnnotation}>Add Annotation</button>
      </div>
      <ul>
        {annotations.map((annotation, index) => (
          <li key={index}>{annotation}</li>
        ))}
      </ul>
    </div>
  );
}

export default Popup;
