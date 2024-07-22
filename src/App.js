// src/App.js
import React, { useState } from 'react';

const App = () => {
  const [audioSrc, setAudioSrc] = useState(null);
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file && file.type === 'video/quicktime') {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);

      videoElement.onloadedmetadata = async () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaSource = audioContext.createMediaElementSource(videoElement);
        const mediaStreamDestination = audioContext.createMediaStreamDestination();

        mediaSource.connect(mediaStreamDestination);
        mediaSource.connect(audioContext.destination);

        const recorder = new MediaRecorder(mediaStreamDestination.stream);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' });
          const audioURL = URL.createObjectURL(blob);
          setAudioSrc(audioURL);
        };

        recorder.start();
        videoElement.play();

        setTimeout(() => {
          recorder.stop();
          videoElement.pause();
        }, 5000); // Adjust the timeout duration as needed
      };
    }
  };

  return (
    <div>
      <h1>Upload MOV and Convert to MP3</h1>
      <input type="file" accept=".mov" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Convert to MP3</button>
      {audioSrc && <audio controls src={audioSrc} />}
    </div>
  );
};

export default App;
