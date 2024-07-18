import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaChartLine, FaComment } from 'react-icons/fa';
import { Button } from './components/ui/Button';
import './styles/tailwind.css';
import ResultsPage from './ResultsPage';

function App() {
  const [file, setFile] = useState(null);
  const [audioResponse, setAudioResponse] = useState(null);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [videoResponse, setVideoResponse] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const [loadingStage, setLoadingStage] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
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
          }).catch((err) => {
            console.error('Error during offline audio rendering:', err);
            reject(err);
          });
        }).catch((err) => {
          console.error('Error decoding audio data:', err);
          reject(err);
        });
      };

      reader.onerror = function (err) {
        console.error('Error reading file:', err);
        reject(err);
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

  const pollAudioProcessingStatus = async (publicId) => {
    try {
      const response = await axios.get(`https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/audio/status/${publicId}`);
      if (response.data.status === 'processing') {
        setTimeout(() => pollAudioProcessingStatus(publicId), 3000); // poll every 3 seconds
      } else {
        setAudioResponse(response.data);
        setAudioProcessing(false);
        analyzeTextWithGpt(response.data.results.amazon.text);
      }
    } catch (error) {
      console.error('Error polling audio processing status:', error);
      setError('Error polling audio processing status');
      setAudioProcessing(false);
    }
  };

  const analyzeTextWithGpt = async (text) => {
    try {
      const response = await axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/audio/analyze-text', { text });
      setGptResponse(response.data);
    } catch (error) {
      console.error('Error analyzing text with GPT-3:', error);
      setError('Error analyzing text with GPT-3');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setAudioResponse(null);
    setVideoResponse(null);
    setGptResponse(null);
    setLoadingStage('uploading');
    setAudioProcessing(true);

    try {
      const audioBlob = 21;

      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, 'audio.wav');
      audioFormData.append('language', language); // Pass the selected language

      const videoFormData = new FormData();
      videoFormData.append('video', file);
      videoFormData.append('language', language); // Pass the selected language

      axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/audio/uploadd', audioFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(audioUploadResponse => {
        const publicId = audioUploadResponse.data.public_id;
        pollAudioProcessingStatus(publicId);
      }).catch(err => {
        console.error('Error uploading audio file:', err);
        setError('Error uploading audio file');
        setLoadingStage(null);
        setAudioProcessing(false);
      });

      axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/video/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(videoUploadResponse => {
        setVideoResponse(videoUploadResponse.data);
        setLoadingStage(null);
      }).catch(err => {
        console.error('Error uploading video file:', err);
        setError('Error uploading video file');
        setLoadingStage(null);
      });

    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error processing file');
      setLoadingStage(null);
      setAudioProcessing(false);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const handleSeeResults = () => {
    navigate('/results', { state: { audioResponse, videoResponse, gptResponse } });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <header className="w-full bg-gray-100 fixed top-0 left-0 right-0 z-10 shadow">
        <div className="w-full mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#3F3F3F', marginLeft: '80px' }}>Speak Smart AI</h1>
        </div>
      </header>
      <div className="mx-auto py-16 px-4 mt-16">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold leading-tight" style={{ color: '#3F3F3F', marginTop: '-10px', marginBottom: '40px' }}>
            <span>Speak Smart AI - </span><span style={{ color: '#126A9C' }}>Master</span>
            <br />
            <span className="block mt-2">Public Speaking</span>
          </h2>
          <p className="text-lg font-thin" style={{ color: '#747474' }}>
            Unlock your potential with personalized feedback on your speech and body language
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-lg w-full max-w-md mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#3F3F3F', marginBottom: '1px', fontSize: '19px' }}>Upload Your Video for Analysis</h2>
            <p className="text-gray-600" style={{ color: '#747474', fontSize: '15px' }}>
              Our AI will analyze your video to evaluate your speech and body language.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div
              className="bg-gray-100 rounded-3xl p-3 md:p-4 grid gap-4 items-center justify-center border-2 border-dashed border-gray-300"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              ref={dropRef}
              style={{ width: '100%', height: '180px', margin: '0 auto' }}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <UploadIcon className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="font-medium" style={{ color: '#3F3F3F', marginTop: '-25px' }}>
                    Drag and drop your video here or <Button variant="link" onClick={() => document.getElementById('fileInput').click()}>click to select a file</Button>
                  </p>
                </div>
                <input id="fileInput" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
              </div>
              {file && (
                <p className="text-center mt-2 text-green-500" style={{ marginTop: '-30px' }}>
                  File has been uploaded successfully.
                </p>
              )}
            </div>
            <div className="flex items-center justify-center">
              <label htmlFor="language" className="mr-2 text-gray-700">Language:</label>
              <select id="language" value={language} onChange={handleLanguageChange} className="bg-gray-100 border border-gray-300 text-gray-700 rounded-md">
                <option value="en">English</option>
                <option value="ru">Russian</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-custom-blue text-white rounded-full py-2 hover:bg-custom-blue-dark">Upload Your Video</Button>
          </form>
          {loadingStage && (
            <div className="flex justify-center mt-4">
              <p style={{ color: '#3F3F3F' }}>{loadingStage === 'uploading' ? 'Uploading your files...' : 'Processing your files...'}</p>
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {(!audioProcessing && audioResponse && videoResponse) && (
            <Button onClick={handleSeeResults} className="w-full bg-custom-blue text-white rounded-full py-2 hover:bg-custom-blue-dark mt-4">View Your Analysis</Button>
          )}
        </div>
        <div>
          <h2 className="text-center mt-24 text-2xl font-bold" style={{ color: '#3F3F3F', fontSize: '30px', marginBottom: '50px' }}>How does it work?</h2>
        </div>
        <section className="w-full flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 w-3/5 gap-10">
            <div className="flex items-start text-left md:text-left w-full max-w-xs mb-4 md:mb-0">
              <FaUpload className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>Upload Your Video</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>Record your speech on any topic and upload it to our platform.</p>
              </div>
            </div>
            <div className="flex items-start text-left md:text-left max-w-xs mx-auto mb-4 md:mb-0">
              <FaChartLine className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>AI Analysis</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>Our AI analyzes your video to evaluate your speech and body language.</p>
              </div>
            </div>
            <div className="flex items-start text-left md:text-left max-w-xs mx-auto mb-4 md:mb-0">
              <FaComment className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>Get Feedback</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>Receive detailed feedback and tips to improve your performance.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function UploadIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="-6 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
