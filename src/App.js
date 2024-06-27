import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await axios.post('http://localhost:7000/api/v1/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const conversationId = res.data.conversationId;
      console.log('Conversation ID:', conversationId);

      const fileAnalysisResponse = await axios.post('http://localhost:7000/api/v1/audio/messages', {
        conversationId
      });

      setResponse(fileAnalysisResponse.data);
    } catch (err) {
      console.error('Upload error:', err);
      setResponse({ error: err.response ? err.response.data : 'Error uploading file' });
    }
  };

  return (
    <div className="App">
      <h1>Audio Upload</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {response && (
        <div>
          <h2>Response:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
          {response.analytics && (
            <div>
              <h3>Analytics:</h3>
              <pre>{JSON.stringify(response.analytics, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
