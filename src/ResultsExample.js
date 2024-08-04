import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import AnalysisBlock from './AnalysisBlock';
import OverallScore from './OverallScore';
import './styles/tailwind.css';
import LeaderboardSection from './components/LeaderboardSection';

const RecommendedVideo = ({ link, language }) => {
  const completeLink = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-blue-800 mb-2">
        {language === 'ru' ? 'Рекомендованное видео для улучшения навыков:' : 'Recommended video to improve your skills:'}
      </h3>
      <p className="text-gray-700 mb-4">
        {language === 'ru' 
          ? 'Мы подобрали для вас видео, которое поможет улучшить ваши навыки публичных выступлений.' 
          : 'We have found a video that can help you improve your public speaking skills.'}
      </p>
      <a 
        href={completeLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        {language === 'ru' ? 'Смотреть видео' : 'Watch Video'}
      </a>
    </div>
  );
};

function ResultsExample() {
  const { exampleId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/examples/${exampleId}.json`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [exampleId]);

  const parseData = (data) => {
    if (typeof data === 'object') {
      return data;
    }
    try {
      return JSON.parse(data);
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

    const summary = parsedVideoData?.description?.summary;

    const videoScores = summary ? [
      summary['BodyOrientation'] ?? summary['Ориентация Тела'] ?? 0,
      summary['FacialExpressions'] ?? summary['Выражения Лица'] ?? 0,
      summary['Gesture Analysis'] ?? summary['Анализ Жестов'] ?? 0,
      summary['NonVerbalCues'] ?? summary['Невербальные Сигналы'] ?? 0,
      summary['PoseAnalysis'] ?? summary['Анализ Позы'] ?? 0,
      summary['Posture Analysis'] ?? summary['Анализ Позиции'] ?? 0,
      summary['ProximityAndSpaceUsage'] ?? summary['Использование Пространства'] ?? 0,
    ] : [];

    const combinedScores = [...gptScores, ...videoScores];

    const overallScore = calculateOverallScore(combinedScores);

    return { overallScore, speechScore: calculateOverallScore(gptScores), bodyLanguageScore: calculateOverallScore(videoScores) };
  };

  const renderGptAnalysis = (gptData) => {
    const parsedData = parseData(gptData);
    if (!parsedData) return null;

    const isRussian = !!parsedData["Анализ настроений"];

    const analysisBlocks = [
      {
        key: isRussian ? "Анализ настроений" : "Sentiment Analysis",
        title: isRussian ? "Анализ настроений" : "Sentiment Analysis",
        score: parsedData["Анализ настроений"]?.["score"] ?? parsedData["Sentiment Analysis"]?.score,
        content: (
          <div>
            <p>{isRussian ? "Общий настрой" : "Overall Sentiment"}: {parsedData["Анализ настроений"]?.["общий настрой"] ?? parsedData["Sentiment Analysis"]?.overall_sentiment}</p>
            <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Анализ настроений"]?.["комментарии"] ?? parsedData["Sentiment Analysis"]?.comments}</p>
          </div>
        ),
      },
      {
        key: isRussian ? "Ясность и связность" : "Clarity and Coherence",
        title: isRussian ? "Ясность и связность" : "Clarity and Coherence",
        score: parsedData["Ясность и связность"]?.["score"] ?? parsedData["Clarity and Coherence"]?.score,
        content: (
          <div>
            <p>{isRussian ? "Ясность" : "Clarity"}: {parsedData["Ясность и связность"]?.["ясность"] ?? parsedData["Clarity and Coherence"]?.clarity}</p>
            <p>{isRussian ? "Связность" : "Coherence"}: {parsedData["Ясность и связность"]?.["связность"] ?? parsedData["Clarity and Coherence"]?.coherence}</p>
            <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Ясность и связность"]?.["комментарии"] ?? parsedData["Clarity and Coherence"]?.comments}</p>
          </div>
        ),
      },
      {
        key: isRussian ? "Анализ тона" : "Tone Analysis",
        title: isRussian ? "Анализ тона" : "Tone Analysis",
        score: parsedData["Анализ тона"]?.["score"] ?? parsedData["Tone Analysis"]?.score,
        content: (
          <div>
            <p>{isRussian ? "Тон" : "Tone"}: {parsedData["Анализ тона"]?.["тон"] ?? parsedData["Tone Analysis"]?.tone}</p>
            <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Анализ тона"]?.["комментарии"] ?? parsedData["Tone Analysis"]?.comments}</p>
          </div>
        ),
      },
      {
        key: isRussian ? "Язык и грамматика" : "Language and Grammar",
        title: isRussian ? "Язык и грамматика" : "Language and Grammar",
        score: parsedData["Язык и грамматика"]?.["score"] ?? parsedData["Language and Grammar"]?.score,
        content: (
          <div>
            <p>{isRussian ? "Найденные ошибки" : "Errors Found"}: {(parsedData["Язык и грамматика"]?.["найденные ошибки"] ?? parsedData["Language and Grammar"]?.errors_found)?.join(', ')}</p>
            <p>{isRussian ? "Предложения" : "Suggestions"}: {(parsedData["Язык и грамматика"]?.["предложения"] ?? parsedData["Language and Grammar"]?.suggestions)?.join(', ')}</p>
            <p>{isRussian ? "Профессионализм языка" : "Language Professionalism"}: {parsedData["Язык и грамматика"]?.["профессионализм языка"] ?? parsedData["Language and Grammar"]?.language_professionalism}</p>
            <p>{isRussian ? "Читабельность" : "Readability"}: {parsedData["Язык и грамматика"]?.["читабельность"] ?? parsedData["Language and Grammar"]?.readability}</p>
          </div>
        ),
      },
      {
        key: isRussian ? "Вовлеченность" : "Engagement",
        title: isRussian ? "Вовлеченность" : "Engagement",
        score: parsedData["Вовлеченность"]?.["score"] ?? parsedData["Engagement"]?.score,
        content: (
          <div>
            <p>{isRussian ? "Вовлеченность" : "Engagement"}: {parsedData["Вовлеченность"]?.["вовлеченность"] ?? parsedData["Engagement"]?.engaging}</p>
            <p>{isRussian ? "Комментарии" : "Comments"}: {parsedData["Вовлеченность"]?.["комментарии"] ?? parsedData["Engagement"]?.comments}</p>
          </div>
        ),
      },
      {
        key: isRussian ? "Улучшенный текст" : "Improved Text",
        title: isRussian ? "Улучшенный текст" : "Improved Text",
        content: <div><p>{parsedData["Улучшенный текст"]?.["текст"] ?? parsedData["Improved Text"]?.text}</p></div>,
        noScore: true
      },
    ];

    return (
      <div className="mt-4">
        {analysisBlocks.map((block) => (
          <AnalysisBlock
            key={block.key}
            title={block.title}
            score={block.noScore ? undefined : block.score}
            content={block.content}
          />
        ))}
      </div>
    );
  };

  const renderBodyLanguageAnalysis = (videoData) => {
    const parsedData = parseData(videoData);
    if (!parsedData) return null;

    const recommendedLink = parsedData.details.links?.link;

    return (
      <div className="mt-4">
        {parsedData.details && Object.keys(parsedData.details).map((key) => (
          key !== 'links' && (
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
          )
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error loading data: {error}</p>;
  }

  if (!data) {
    return <p>No data found for this example.</p>;
  }

  const { overallScore, speechScore, bodyLanguageScore } = calculateScores(data.gptResponse, data.videoResponse);

  const isRussian = data.gptResponse && parseData(data.gptResponse)["Анализ настроений"];

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto py-16 px-4 mt-16 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold leading-tight text-gray-900 mb-4">
            {isRussian ? 'Результаты анализа' : 'Analysis Results'}
          </h2>
          
          <p className="text-lg font-light text-gray-700">
            {isRussian ? 'Детальная обратная связь по вашей речи и языку тела' : 'Detailed feedback on your speech and body language'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg w-full">
          {data.audioResponse && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800">{isRussian ? 'Ваш результат:' : 'Your Result:'}</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-6">
                <div className="w-full md:w-1/2 lg:w-1/3">
                  <OverallScore score={overallScore} language={isRussian ? 'ru' : 'en'} />
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3">
                  <LeaderboardSection score={overallScore} language={isRussian ? 'ru' : 'en'} />
                </div>
              </div>
              <pre className="bg-gray-100 p-6 rounded text-gray-800 whitespace-pre-wrap w-full mt-8">{data.audioResponse.results.openai.text}</pre>

              { data.gptResponse.links && (
                <RecommendedVideo 
                  link={data.gptResponse.links.link} 
                  language={isRussian ? 'ru' : 'en'}
                />
              )}

              {data.gptResponse && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800">{isRussian ? 'Анализ речи' : 'Speech Analysis'}</h3>
                  {renderGptAnalysis(data.gptResponse)}
                </div>
              )}
            </div>
          )}

          {data.videoResponse && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800">{isRussian ? 'Анализ языка тела:' : 'Body Language Analysis:'}</h3>
              {renderBodyLanguageAnalysis(data.videoResponse.description)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResultsExample;
