import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaChartLine, FaComment } from 'react-icons/fa';
import { Button } from './components/ui/Button';
import './styles/tailwind.css';
import ResultsPage from './ResultsPage';
import Footer from './components/Footer';
import ProgressBar from './components/ProgressBar';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Examples from './components/Examples';
import Testimonials from './components/Testimonials';
import ResultsExample from './ResultsExample';

// Set the default language to Russian
i18n.changeLanguage('ru');

function App() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [audioResponse, setAudioResponse] = useState(null);
  const [videoResponse, setVideoResponse] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ru');
  const [loadingStage, setLoadingStage] = useState(null);
  const [status, setStatus] = useState('Uploading');
  const [progress, setProgress] = useState(0);
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingStage === 'uploading') {
      const duration = 168; // 2.8 minutes in seconds
      const interval = 1000; // interval in milliseconds (1 second)

      const intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return prevProgress + (100 / duration);
        });
      }, interval);

      return () => clearInterval(intervalId);
    } else {
      setProgress(0);
    }
  }, [loadingStage]);

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


  const processAndUploadVideo = async (file) => {
    return new Promise((resolve, reject) => {
      const videoUrl = URL.createObjectURL(file);
  
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      videoElement.muted = true; // Keep this to ensure no audio plays
      videoElement.preload = 'metadata';
  
      videoElement.onloadedmetadata = async () => {
        const reducedWidth = videoElement.videoWidth / 2;
        const reducedHeight = videoElement.videoHeight / 2;
  
        const canvasElement = document.createElement('canvas');
        canvasElement.width = reducedWidth;
        canvasElement.height = reducedHeight;
        const context = canvasElement.getContext('2d');
  
        const stream = canvasElement.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/mp4',
          videoBitsPerSecond: 1000000
        });
  
        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
  
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/mp4' });
          const processedVideo = new File([blob], 'processed-video.mp4', { type: 'video/mp4' });
          resolve(processedVideo);
        };
  
        mediaRecorder.start();
  
        const processFrame = async (time) => {
          if (time > videoElement.duration * 1000) {
            mediaRecorder.stop();
            return;
          }
  
          videoElement.currentTime = time / 1000;
          await new Promise(resolve => {
            videoElement.onseeked = resolve;
          });
  
          context.drawImage(videoElement, 0, 0, reducedWidth, reducedHeight);
          requestAnimationFrame(() => processFrame(time + (1000 / 30) * 8)); // Simulate 8x speed
        };
  
        processFrame(0);
      };
  
      videoElement.onerror = (error) => {
        reject(error);
      };
    });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setAudioResponse(null);
    setVideoResponse(null);
    setGptResponse(null);
    setLoadingStage('uploading');
    setStatus('Uploading');

    if (!file) {
      setError(t('error.no_file'));
      setLoadingStage(null);
      return;
    }

    try {
      const processedVideo = await processAndUploadVideo(file);

      const videoFormData1 = new FormData();
      const videoFormData2 = new FormData();
      videoFormData1.append('video', processedVideo);
      videoFormData1.append('language', language);
      videoFormData2.append('video', file);
      videoFormData2.append('language', language);

      const videoUploadRequest = axios.post('https://speaksmart2.azurewebsites.net/api/v1/video/upload', videoFormData1, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await new Promise(resolve => setTimeout(resolve, 150));

      const audioUploadResponse = await axios.post('https://speaksmart2.azurewebsites.net/api/v1/audio/upload', videoFormData2, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const text = audioUploadResponse.data.results.openai.text;
      setAudioResponse(audioUploadResponse.data);

      const gptResponse = await axios.post('https://speaksmart2.azurewebsites.net/api/v1/audio/analyze-text', { text, language });
      setGptResponse(gptResponse.data.gpt_response);

      const videoUploadResponse = await videoUploadRequest;
      setVideoResponse(videoUploadResponse.data);

      setLoadingStage(null);
    } catch (err) {
      setError(t('error.upload_error'));
      setLoadingStage(null);
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    i18n.changeLanguage(event.target.value);
  };

  const handleSeeResults = () => {
    navigate('/results', { state: { audioResponse, videoResponse, gptResponse } });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <header className="w-full bg-gray-100 fixed top-0 left-0 right-0 z-10 shadow">
        <div className="w-full mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#3F3F3F' }}>
            {t('title')}
          </h1>
          <div className="flex items-center">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-blue-500 text-white font-bold border border-blue-700 rounded-md px-4 py-3 text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: '150px' }}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </header>


      <div className="mx-auto py-16 px-4 mt-16">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold leading-tight" style={{ color: '#3F3F3F', marginTop: '-10px', marginBottom: '40px' }}>
            <span>{t('title')} - </span><span style={{ color: '#126A9C' }}>{t('subtitle')}</span>
            <br />
          </h2>
          <p className="text-lg font-thin" style={{ color: '#747474' }}>
            {t('description')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-lg w-full max-w-md mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold" style={{ color: '#3F3F3F', marginBottom: '1px', fontSize: '19px' }}>{t('upload_instruction')}</h2>
            <p className="text-gray-600" style={{ color: '#747474', fontSize: '15px' }}>
              {t('upload_description')}
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
                    {t('drag_and_drop')} <Button variant="link" onClick={handleButtonClick}>{t('click_to_select')}</Button>
                  </p>
                </div>
                <input id="fileInput" type="file" accept="video/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
              </div>
              {file && (
                <p className="text-center mt-2 text-green-500" style={{ marginTop: '-30px' }}>
                  {t('file_uploaded')}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center">
              <label htmlFor="language" className="mr-2 text-gray-700">{t('language')}:</label>
              <select
                id="language"
                value={language}
                onChange={handleLanguageChange}
                className="bg-gray-100 border border-gray-300 text-gray-700 rounded-md px-4 py-3 text-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full py-3 hover:from-blue-600 hover:to-green-600 shadow-lg text-lg font-bold">{t('upload_button')}</Button>
          </form>
          {loadingStage && (
            <div className="mt-4">
              <ProgressBar progress={Math.floor(progress)} />
              <div className="flex justify-center mt-2">
                <p style={{ color: '#3F3F3F' }}>{status}</p>
              </div>
            </div>
          )}
          {audioResponse && videoResponse && gptResponse && (
            <Button onClick={handleSeeResults} className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full py-3 hover:from-blue-600 hover:to-green-600 shadow-lg text-lg font-bold mt-4">{t('view_analysis')}</Button>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        <Examples language={language} />
        <div>
          <h2 className="text-center mt-24 text-2xl font-bold" style={{ color: '#3F3F3F', fontSize: '30px', marginBottom: '50px' }}>{t('how_it_works')}</h2>
        </div>
        <section className="w-full flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 w-3/5 gap-10">
            <div className="flex items-start text-left md:text-left w-full max-w-xs mb-4 md:mb-0">
              <FaUpload className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>{t('step1_title')}</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>{t('step1_description')}</p>
              </div>
            </div>
            <div className="flex items-start text-left md:text-left max-w-xs mx-auto mb-4 md:mb-0">
              <FaChartLine className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>{t('step2_title')}</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>{t('step2_description')}</p>
              </div>
            </div>
            <div className="flex items-start text-left md:text-left max-w-xs mx-auto mb-4 md:mb-0">
              <FaComment className="w-16 h-16 mr-4 text-blue-500" />
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#3F3F3F', marginBottom: '5px' }}>{t('step3_title')}</h3>
                <p style={{ color: '#747474', fontSize: '18px' }}>{t('step3_description')}</p>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
      </div>
      <Footer />
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
        <Route path="/results_example/:exampleId" element={<ResultsExample />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;