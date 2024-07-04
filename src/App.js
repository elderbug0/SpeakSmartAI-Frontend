import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { Progress } from './components/ui/Progress';
import './styles/tailwind.css';

function App() {
  const [file, setFile] = useState(null);
  const [audioResponse, setAudioResponse] = useState(null);
  const [videoResponse, setVideoResponse] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setAudioResponse(null);
    setVideoResponse(null);

    try {
      const audioBlob = await extractAudioFromVideo(file);

      const audioFormData = new FormData();
      audioFormData.append('audio', audioBlob, 'audio.wav');
      audioFormData.append('language', language);

      const videoFormData = new FormData();
      videoFormData.append('video', file);
      videoFormData.append('language', language);

      axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/audio/upload', audioFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(audioUploadResponse => {
        const conversationId = audioUploadResponse.data.conversationId;

        axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/audio/messages', { conversationId })
          .then(fileAnalysisResponse => {
            setAudioResponse(fileAnalysisResponse.data);
          })
          .catch(err => {
            setError('Error analyzing audio file');
          });
      }).catch(err => {
        setError('Error uploading audio file');
      });

      axios.post('https://node-ts-boilerplate-production-79e3.up.railway.app/api/v1/video/upload', videoFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then(videoUploadResponse => {
        setVideoResponse(videoUploadResponse.data);
      }).catch(err => {
        setError('Error uploading video file');
      });

    } catch (err) {
      setError('Error processing file');
    }
  };

  const handleLanguageChange = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const getTranslation = (text) => {
    const translations = {
      en: {
        title: "Video Upload",
        uploadButton: "Upload",
        bodyLanguageAnalysis: "Body Language Analysis:",
        transcript: "Transcript:",
        analytics: "Analytics:",
        talkVsSilence: "Talk vs Silence",
        speechSpeed: "Speech Speed",
        longestMonologue: "Longest Monologue",
        error: "Error processing file"
      },
      ru: {
        title: "Загрузка видео",
        uploadButton: "Загрузить",
        bodyLanguageAnalysis: "Анализ языка тела:",
        transcript: "Транскрипт:",
        analytics: "Аналитика:",
        talkVsSilence: "Разговор против тишины",
        speechSpeed: "Скорость речи",
        longestMonologue: "Самый длинный монолог",
        error: "Ошибка обработки файла"
      }
    };
    return translations[language][text];
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 md:py-16">
      <button onClick={handleLanguageChange} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        {language === 'en' ? 'Switch to Russian' : 'Switch to English'}
      </button>
      <div className="grid gap-8">
        <div className="bg-white rounded-xl p-6 md:p-8 grid gap-6 shadow-lg">
          <div className="grid gap-2">
            <h2 className="text-2xl font-bold">{getTranslation('title')}</h2>
            <p className="text-gray-600">
              Gain valuable insights about your video content with our AI-powered analysis.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div
                className="bg-gray-100 rounded-xl p-6 md:p-8 grid gap-4 items-center justify-center border-2 border-dashed border-gray-300"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                ref={dropRef}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <UploadIcon className="w-12 h-12 text-blue-500" />
                  <div className="text-center">
                    <p className="font-medium">
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
              <Button type="submit" className="w-full">{getTranslation('uploadButton')}</Button>
            </div>
          </form>
          {error && <p className="text-red-500">{getTranslation('error')}</p>}
          <div className="container mt-8">
            {videoResponse && (
              <Card className="description">
                <CardHeader>
                  <CardTitle>{getTranslation('bodyLanguageAnalysis')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div dangerouslySetInnerHTML={{ __html: videoResponse.description.replace(/\n/g, '<br>') }} />
                </CardContent>
              </Card>
            )}
            {audioResponse && audioResponse.transcript && (
              <Card className="transcription">
                <CardHeader>
                  <CardTitle>{getTranslation('transcript')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {audioResponse.transcript.messages.map((message, index) => (
                    <div key={index}>
                      <p><strong>Duration:</strong> {message.duration}</p>
                      <p><strong>Text:</strong> {message.text}</p>
                      <p><strong>Sentiment:</strong> {message.sentiment.suggested}</p>
                      <hr />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {audioResponse && audioResponse.analytics && (
              <Card className="analytics">
                <CardHeader>
                  <CardTitle>{getTranslation('analytics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="analytics-item">
                    <h3>{getTranslation('talkVsSilence')}</h3>
                    <span>{audioResponse.analytics.metrics.find(m => m.type === 'total_talk_time')?.percent ?? 'N/A'}% Talk</span>
                  </div>
                  <div className="analytics-item">
                    <h3>{getTranslation('speechSpeed')}</h3>
                    <span>{audioResponse.analytics.members?.[0]?.pace?.wpm ?? 'N/A'} words/min</span>
                  </div>
                  <div className="analytics-item">
                    <h3>{getTranslation('longestMonologue')}</h3>
                    <span>{audioResponse.analytics.members?.[0]?.talkTime?.seconds ?? 'N/A'} seconds</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
