import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [audioResponse, setAudioResponse] = useState(null);
  const [videoResponse, setVideoResponse] = useState(null);
  const [error, setError] = useState(null);

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
    setError(null);
    setAudioResponse(null);
    setVideoResponse(null);

    try {
      const audioBlob = await extractAudioFromVideo(file);

      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, 'audio.wav');

      const videoFormData = new FormData();
      videoFormData.append('video', file);

      axios.post('http://localhost:7000/api/v1/audio/upload', audioFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(audioUploadResponse => {
        console.log('Audio Upload Response:', audioUploadResponse.data);
        const conversationId = audioUploadResponse.data.conversationId;
        console.log('Conversation ID:', conversationId);

        axios.post('http://localhost:7000/api/v1/audio/messages', { conversationId })
          .then(fileAnalysisResponse => {
            console.log('File Analysis Response:', fileAnalysisResponse.data);
            setAudioResponse(fileAnalysisResponse.data);
          })
          .catch(err => {
            console.error('File analysis error:', err);
            setError('Error analyzing audio file');
          });
      }).catch(err => {
        console.error('Audio upload error:', err);
        setError('Error uploading audio file');
      });

      axios.post('http://localhost:7000/api/v1/video/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(videoUploadResponse => {
        console.log('Video Upload Response:', videoUploadResponse.data);
        setVideoResponse(videoUploadResponse.data);
      }).catch(err => {
        console.error('Video upload error:', err);
        setError('Error uploading video file');
      });

    } catch (err) {
      console.error('Upload error:', err);
      setError('Error processing file');
    }
  };

  return (
    <div className="App">
      <h1>Video Upload</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="container">
        {videoResponse && (
          <div className="card description">
            <h2>Generated Description:</h2>
            <p>{videoResponse.description}</p>
          </div>
        )}
        {audioResponse && audioResponse.transcript && (
          <div className="card transcription">
            <h2>Transcript:</h2>
            {audioResponse.transcript.messages.map((message, index) => (
              <div key={index}>
                <p><strong>Duration:</strong> {message.duration}</p>
                <p><strong>Text:</strong> {message.text}</p>
                <p><strong>Sentiment:</strong> {message.sentiment.suggested}</p>
                <hr />
              </div>
            ))}
          </div>
        )}
        {audioResponse && audioResponse.analytics && (
          <div className="card analytics">
            <h2>Analytics:</h2>
            <div className="analytics-item">
              <h3>Talk vs Silence</h3>
              <span>{audioResponse.analytics.metrics.find(m => m.type === 'total_talk_time').percent}% Talk</span>
            </div>
            <div className="analytics-item">
              <h3>Speech Speed</h3>
              <span>{audioResponse.analytics.members[0].pace.wpm} words/min</span>
            </div>
            <div className="analytics-item">
              <h3>Longest Monologue</h3>
              <span>{audioResponse.analytics.members[0].talkTime.seconds} seconds</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
