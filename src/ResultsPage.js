import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import AnalysisBlock from './AnalysisBlock';
import OverallScore from './OverallScore';
import './styles/tailwind.css';

const ResultsPage = () => {
  const location = useLocation();
  const { audioResponse, videoResponse, gptResponse } = location.state || {};

  const parseData = (data) => {
    if (typeof data === 'object') {
      return data; // Already an object, no need to parse
    }
    try {
      return JSON.parse(data); // Try to parse as JSON
    } catch (error) {
      console.error('Error parsing data:', error);
      return null;
    }
  };

  const calculateOverallScore = (scores) => {
    const totalScore = scores.reduce((acc, score) => acc + score, 0);
    const maxScore = scores.length * 10;
    return (totalScore / maxScore) * 100;
  };

  const calculateScores = (gptData, videoData) => {
    const parsedGptData = parseData(gptData);
    const parsedVideoData = parseData(videoData);

    const gptScores = parsedGptData ? [
      parsedGptData["Sentiment Analysis"]?.score ?? parsedGptData["Анализ настроений"]?.score ?? 0,
      parsedGptData["Clarity and Coherence"]?.score ?? parsedGptData["Ясность и связность"]?.score ?? 0,
      parsedGptData["Tone Analysis"]?.score ?? parsedGptData["Анализ тона"]?.score ?? 0,
      parsedGptData["Language and Grammar"]?.score ?? parsedGptData["Язык и грамматика"]?.score ?? 0,
      parsedGptData["Engagement"]?.score ?? parsedGptData["Вовлеченность"]?.score ?? 0,
    ] : [];

    console.log('Parsed GPT Data:', parsedGptData);
    console.log('GPT Scores:', gptScores);

    const summary = JSON.parse(parsedVideoData.description).summary;
    console.log(summary);

    const videoScores = summary ? [
      summary['Body Orientation'] ?? summary['Ориентация Тела'] ?? 0,
      summary['Facial Expressions'] ?? summary['Выражения Лица'] ?? 0,
      summary['Gesture Analysis'] ?? summary['Анализ Жестов'] ?? 0,
      summary['NonVerbal Cues'] ?? summary['Невербальные Сигналы'] ?? 0,
      summary['Pose Analysis'] ?? summary['Анализ Позы'] ?? 0,
      summary['Posture Analysis'] ?? summary['Анализ Позиции'] ?? 0,
      summary['Proximity And Space Usage'] ?? summary['Использование Пространства'] ?? 0,
    ] : [];

    console.log('Video Scores:', videoScores);

    const combinedScores = [...gptScores, ...videoScores];

    const overallScore = calculateOverallScore(combinedScores);

    return { overallScore, speechScore: calculateOverallScore(gptScores), bodyLanguageScore: calculateOverallScore(videoScores) };
  };

  const { overallScore, speechScore, bodyLanguageScore } = calculateScores(gptResponse, videoResponse);

  const renderGptAnalysis = (gptData) => {
    const parsedData = parseData(gptData);
    if (!parsedData) return null;

    const isRussian = !!parsedData["Анализ настроений"];

    return (
      <div className="mt-4">
        <AnalysisBlock
          title={isRussian ? "Анализ настроений" : "Sentiment Analysis"}
          score={parsedData["Sentiment Analysis"]?.score ?? parsedData["Анализ настроений"]?.score ?? 0}
          content={
            <div>
              <p>{isRussian ? "Общий настрой" : "Overall Sentiment"}: {parsedData["Sentiment Analysis"]?.overall_sentiment ?? parsedData["общий настрой"]}</p>
              <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Sentiment Analysis"]?.comments ?? parsedData["комментарии"]}</p>
            </div>
          }
        />
        <AnalysisBlock
          title={isRussian ? "Ясность и связность" : "Clarity and Coherence"}
          score={parsedData["Clarity and Coherence"]?.score ?? parsedData["Ясность и связность"]?.score ?? 0}
          content={
            <div>
              <p>{isRussian ? "Ясность" : "Clarity"}: {parsedData["Clarity and Coherence"]?.clarity ?? parsedData["ясность"]}</p>
              <p>{isRussian ? "Связность" : "Coherence"}: {parsedData["Clarity and Coherence"]?.coherence ?? parsedData["связность"]}</p>
              <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Clarity and Coherence"]?.comments ?? parsedData["комментарии"]}</p>
            </div>
          }
        />
        <AnalysisBlock
          title={isRussian ? "Анализ тона" : "Tone Analysis"}
          score={parsedData["Tone Analysis"]?.score ?? parsedData["Анализ тона"]?.score ?? 0}
          content={
            <div>
              <p>{isRussian ? "Тон" : "Tone"}: {parsedData["Tone Analysis"]?.tone ?? parsedData["тон"]}</p>
              <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Tone Analysis"]?.comments ?? parsedData["комментарии"]}</p>
            </div>
          }
        />
        <AnalysisBlock
          title={isRussian ? "Язык и грамматика" : "Language and Grammar"}
          score={parsedData["Language and Grammar"]?.score ?? parsedData["Язык и грамматика"]?.score ?? 0}
          content={
            <div>
              <p>{isRussian ? "Найденные ошибки" : "Errors Found"}: {(parsedData["Language and Grammar"]?.errors_found ?? parsedData["найденные ошибки"])?.join(', ')}</p>
              <p>{isRussian ? "Предложения" : "Suggestions"}: {(parsedData["Language and Grammar"]?.suggestions ?? parsedData["предложения"])?.join(', ')}</p>
              <p>{isRussian ? "Профессионализм языка" : "Language Professionalism"}: {parsedData["Language and Grammar"]?.language_professionalism ?? parsedData["профессионализм языка"]}</p>
              <p>{isRussian ? "Читабельность" : "Readability"}: {parsedData["Language and Grammar"]?.readability ?? parsedData["читабельность"]}</p>
            </div>
          }
        />
        <AnalysisBlock
          title={isRussian ? "Вовлеченность" : "Engagement"}
          score={parsedData["Engagement"]?.score ?? parsedData["Вовлеченность"]?.score ?? 0}
          content={
            <div>
              <p>{isRussian ? "Вовлеченность" : "Engaging"}: {parsedData["Engagement"]?.engaging ?? parsedData["вовлеченность"]}</p>
              <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Engagement"]?.comments ?? parsedData["комментарии"]}</p>
            </div>
          }
        />
        <AnalysisBlock
          title={isRussian ? "Улучшенный текст" : "Improved Text"}
          content={<div><p>{parsedData["Improved Text"]?.text ?? parsedData["Улучшенный текст"]?.текст}</p></div>}
        />
      </div>
    );
  };

  const renderBodyLanguageAnalysis = (videoData) => {
    const parsedData = parseData(videoData);
    if (!parsedData) return null;

    return (
      <div className="mt-4">
        {parsedData.details && Object.keys(parsedData.details).map((key) => (
          <AnalysisBlock
            key={key}
            title={key.replace(/([A-Z])/g, ' $1').trim()}
            score={parsedData.summary[key] ?? parsedData.summary[translateKey(key)] ?? 0}
            content={
              <div>
                {parsedData.details[key] && Object.keys(parsedData.details[key]).map((detailKey) => (
                  <div key={detailKey} className="mb-2">
                    <p className="font-semibold">{detailKey.replace(/([A-Z])/g, ' $1').trim()}</p>
                    {typeof parsedData.details[key][detailKey] === 'object' ? (
                      <div className="ml-4">
                        {Object.keys(parsedData.details[key][detailKey]).map((subKey) => (
                          <p key={subKey}>{`${subKey.replace(/([A-Z])/g, ' $1').trim()}: ${parsedData.details[key][detailKey][subKey]}`}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="ml-4">{parsedData.details[key][detailKey]}</p>
                    )}
                  </div>
                ))}
              </div>
            }
          />
        ))}
      </div>
    );
  };

  const translateKey = (key) => {
    const translations = {
      BodyOrientation: 'Ориентация Тела',
      FacialExpressions: 'Выражения Лица',
      GestureAnalysis: 'Анализ Жестов',
      NonVerbalCues: 'Невербальные Сигналы',
      PoseAnalysis: 'Анализ Позы',
      PostureAnalysis: 'Анализ Позиции',
      ProximityAndSpaceUsage: 'Использование Пространства',
    };
    return translations[key] || key;
  };

  const isRussian = gptResponse && parseData(gptResponse)["Анализ настроений"];

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto py-16 px-4 mt-16 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold leading-tight" style={{ color: '#3F3F3F', marginBottom: '20px' }}>
            {isRussian ? 'Результаты анализа' : 'Analysis Results'}
          </h2>
          
          <p className="text-lg font-thin" style={{ color: '#747474' }}>
            {isRussian ? 'Детальная обратная связь по вашей речи и языку тела' : 'Detailed feedback on your speech and body language'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg w-full">
          {audioResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">{isRussian ? 'Ваш результат:' : 'Your Result:'}</h3>
              <div className="flex flex-col items-center" style={{marginTop:'40px'}}>
                <OverallScore score={overallScore} language={isRussian ? 'ru' : 'en'} />
              </div>
              <pre className="bg-gray-100 p-6 rounded text-gray-800 pre-wrap w-full mt-8">{audioResponse.results.openai.text}</pre>
              {gptResponse && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">{isRussian ? 'Анализ речи' : 'Speech Analysis'}</h3>
                  {renderGptAnalysis(gptResponse)}
                </div>
              )}
            </div>
          )}

          {videoResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">{isRussian ? 'Анализ языка тела:' : 'Body Language Analysis:'}</h3>
              {renderBodyLanguageAnalysis(videoResponse.description)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
