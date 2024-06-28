import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const extractAudioFromVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = function () {
        const arrayBuffer = reader.result;

        audioContext.decodeAudioData(arrayBuffer).then((decodedAudioData) => {
          const offlineAudioContext = new OfflineAudioContext(
            decodedAudioData.numberOfChannels,
            decodedAudioData.duration * decodedAudioData.sampleRate,
            decodedAudioData.sampleRate
          );
          const soundSource = offlineAudioContext.createBufferSource();
          soundSource.buffer = decodedAudioData;
          soundSource.connect(offlineAudioContext.destination);
          soundSource.start();

          offlineAudioContext.startRendering().then((renderedBuffer) => {
            const wavBlob = audioBufferToWav(renderedBuffer);
            resolve(wavBlob);
          }).catch(reject);
        }).catch(reject);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const audioBufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferArray = new ArrayBuffer(length),
      view = new DataView(bufferArray),
      channels = [],
      sampleRate = buffer.sampleRate;

    let offset = 0;
    let pos = 0;

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(sampleRate);
    setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true); // write 16-bit sample
        pos += 2;
      }
      offset++;
    }

    return new Blob([bufferArray], { type: "audio/wav" });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const audioBlob = await extractAudioFromVideo(file);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const uploadResponse = await axios.post('http://localhost:7000/api/v1/audio/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const conversationId = uploadResponse.data.conversationId;
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
      <h1>Video Upload</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {response && (
        <div>
          <h2>Response:</h2>
          {response.transcript && (
            <div>
              <h3>Transcript:</h3>
              <pre>{JSON.stringify(response.transcript, null, 2)}</pre>
            </div>
          )}
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
