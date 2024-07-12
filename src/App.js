import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import './styles/tailwind.css';

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

  const pollAudioProcessingStatus = async (publicId) => {
    try {
      const response = await axios.get(`http://localhost:7000/api/v1/audio/status/${publicId}`);
      if (response.data.status === 'processing') {
        setTimeout(() => pollAudioProcessingStatus(publicId), 3000); // poll every 3 seconds
      } else {
        setAudioResponse(response.data);
        setAudioProcessing(false);
        analyzeTextWithGpt(response.data.results.amazon.text);
      }
    } catch (error) {
      setError('Error polling audio processing status');
      setAudioProcessing(false);
    }
  };

  const analyzeTextWithGpt = async (text) => {
    try {
      const response = await axios.post('http://localhost:7000/api/v1/audio/analyze-text', { text });
      setGptResponse(response.data);
    } catch (error) {
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
      const audioBlob = await extractAudioFromVideo(file);

      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, 'audio.wav');
      audioFormData.append('language', language);

      const videoFormData = new FormData();
      videoFormData.append('video', file);
      videoFormData.append('language', language);

      axios.post('http://localhost:7000/api/v1/audio/uploadd', audioFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(audioUploadResponse => {
        const publicId = audioUploadResponse.data.public_id;
        pollAudioProcessingStatus(publicId);
      }).catch(err => {
        setError('Error uploading audio file');
        setLoadingStage(null);
        setAudioProcessing(false);
      });

      axios.post('http://localhost:7000/api/v1/video/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(videoUploadResponse => {
        setVideoResponse(videoUploadResponse.data);
        setLoadingStage(null);
      }).catch(err => {
        setError('Error uploading video file');
        setLoadingStage(null);
      });

    } catch (err) {
      setError('Error processing file');
      setLoadingStage(null);
      setAudioProcessing(false);
    }
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const getTranslation = (text) => {
    const translations = {
      en: {
        title: "Speak Smart AI - Master Public Speaking",
        description: "Unlock your potential with personalized feedback on your speech and body language",
        uploadButton: "Select",
        bodyLanguageAnalysis: "Body Language Analysis:",
        transcript: "Transcript:",
        gptAnalysis: "GPT Analysis:",
        analytics: "Analytics:",
        talkVsSilence: "Talk vs Silence",
        speechSpeed: "Speech Speed",
        longestMonologue: "Longest Monologue",
        error: "Error processing file",
        uploading: "Uploading files...",
        processingAudio: "Processing audio...",
        processingVideo: "Processing video...",
        howItWorks: "How does it work?",
        step1: "Upload your video",
        step1Desc: "Record your speech on any topic and upload on our platform",
        step2: "AI Analysis",
        step2Desc: "Our AI analyzes your video and evaluates your speech and body language",
        step3: "Get Feedback",
        step3Desc: "Receive detailed feedback and tips to improve your performance"
      },
      ru: {
        title: "Speak Smart AI - Master Public Speaking",
        description: "Unlock your potential with personalized feedback on your speech and body language",
        uploadButton: "Select",
        bodyLanguageAnalysis: "Анализ языка тела:",
        transcript: "Транскрипт:",
        gptAnalysis: "GPT анализ:",
        analytics: "Аналитика:",
        talkVsSilence: "Разговор против тишины",
        speechSpeed: "Скорость речи",
        longestMonologue: "Самый длинный монолог",
        error: "Ошибка обработки файла",
        uploading: "Загрузка файлов...",
        processingAudio: "Обработка аудио...",
        processingVideo: "Обработка видео...",
        howItWorks: "Как это работает?",
        step1: "Загрузите ваше видео",
        step1Desc: "Запишите свою речь на любую тему и загрузите на нашу платформу",
        step2: "Анализ AI",
        step2Desc: "Наш AI анализирует ваше видео и оценивает вашу речь и язык тела",
        step3: "Получите обратную связь",
        step3Desc: "Получите подробные отзывы и советы по улучшению вашего выступления"
      }
    };
    return translations[language][text];
  };

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl mx-auto py-12 md:py-16">
        <header className="flex justify-between items-center pb-4 border-b border-gray-300">
          <h1 className="text-xl font-bold text-gray-800">Speak Smart AI</h1>
          <nav className="space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-800">Contact us</a>
          </nav>
          <button onClick={handleLanguageChange} className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {language === 'en' ? 'Switch to Russian' : 'Switch to English'}
          </button>
        </header>
        <main className="bg-white rounded-xl p-6 md:p-8 grid gap-6 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{getTranslation('title')}</h2>
            <p className="text-gray-600">{getTranslation('description')}</p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div
              className="bg-gray-100 rounded-xl p-6 md:p-8 grid gap-4 items-center justify-center border-2 border-dashed border-gray-300"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              ref={dropRef}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <p className="font-medium text-gray-800">
                    Drag and drop your video here or <Button variant="link" onClick={() => document.getElementById('fileInput').click()}>select a file</Button>
                  </p>
                  <p className="text-gray-500 text-sm">Supported formats: MP4, MOV, AVI</p>
                </div>
                <input id="fileInput" type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
              </div>
              {file && (
                <p className="text-center mt-2 text-green-500">
                  {file.name} has been uploaded successfully.
                </p>
              )}
            </div>
            <Button type="submit" className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600">{getTranslation('uploadButton')}</Button>
          </form>
          {loadingStage && (
            <div className="flex justify-center">
              <p className="text-gray-800">{getTranslation(loadingStage)}</p>
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {error && <p className="text-red-500">{getTranslation('error')}</p>}
          {!audioProcessing && audioResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Audio Analysis Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-gray-800 pre-wrap">{audioResponse.results.amazon.text}</pre>
              {gptResponse && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">{getTranslation('gptAnalysis')}</h3>
                  <pre className="bg-gray-100 p-4 rounded text-gray-800 pre-wrap">{gptResponse}</pre>
                </div>
              )}
            </div>
          )}
          {videoResponse && (
            <Card className="description">
              <CardHeader>
                <CardTitle className="text-gray-800">{getTranslation('bodyLanguageAnalysis')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: videoResponse.description.replace(/\n/g, '<br>') }} />
              </CardContent>
            </Card>
          )}
        </main>
        <section className="mt-12">
          <h2 className="text-center text-2xl font-bold text-gray-800">{getTranslation('howItWorks')}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">{getTranslation('step1')}</h3>
              <p className="text-gray-600">{getTranslation('step1Desc')}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">{getTranslation('step2')}</h3>
              <p className="text-gray-600">{getTranslation('step2Desc')}</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800">{getTranslation('step3')}</h3>
              <p className="text-gray-600">{getTranslation('step3Desc')}</p>
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
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

export default App;
