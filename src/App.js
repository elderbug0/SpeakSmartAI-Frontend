import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUpload, FaChartLine, FaComment } from 'react-icons/fa';
import { Button } from './components/ui/Button';
import './styles/tailwind.css';
import ResultsPage from './ResultsPage';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

function App() {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [audioResponse, setAudioResponse] = useState(null);
  const [videoResponse, setVideoResponse] = useState(null);
  const [gptResponse, setGptResponse] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const [loadingStage, setLoadingStage] = useState(null);
  const [status, setStatus] = useState('Uploading');
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);
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
      const videoFormData = new FormData();
      videoFormData.append('video', file);
      videoFormData.append('language', language);

      const videoUploadRequest = axios.post('https://speaksmartai-xyz.azurewebsites.net/api/v1/video/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const audioUploadResponse = await axios.post('https://speaksmartai-xyz.azurewebsites.net/api/v1/audio/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const text = audioUploadResponse.data.results.openai.text;
      setAudioResponse(audioUploadResponse.data);

      const gptResponse = await axios.post('https://speaksmartai-xyz.azurewebsites.net/api/v1/audio/analyze-text', { text, language });
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
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#3F3F3F', marginLeft: '80px' }}>{t('title')}</h1>
          <select value={language} onChange={handleLanguageChange} className="bg-gray-100 border border-gray-300 text-gray-700 rounded-md">
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
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
              <select id="language" value={language} onChange={handleLanguageChange} className="bg-gray-100 border border-gray-300 text-gray-700 rounded-md">
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-custom-blue text-white rounded-full py-2 hover:bg-custom-blue-dark">{t('upload_button')}</Button>
          </form>
          {loadingStage && (
            <div className="flex justify-center mt-4">
              <p style={{ color: '#3F3F3F' }}>{status}</p>
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {audioResponse && videoResponse && gptResponse && (
            <Button onClick={handleSeeResults} className="w-full bg-custom-blue text-white rounded-full py-2 hover:bg-custom-blue-dark mt-4">{t('view_analysis')}</Button>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
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
