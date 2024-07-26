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
      parsedGptData["Sentiment Analysis"]?.score ?? 0,
      parsedGptData["Clarity and Coherence"]?.score ?? 0,
      parsedGptData["Tone Analysis"]?.score ?? 0,
      parsedGptData["Language and Grammar"]?.score ?? 0,
      parsedGptData["Engagement"]?.score ?? 0,
    ] : [];

    const videoScores = parsedVideoData?.details ? Object.keys(parsedVideoData.details).map(
      (key) => parsedVideoData.summary[key] ?? 0
    ) : [];

    const speechScore = calculateOverallScore(gptScores);
    const bodyLanguageScore = calculateOverallScore(videoScores);

    return { speechScore, bodyLanguageScore };
  };

  const { speechScore, bodyLanguageScore } = calculateScores(gptResponse, videoResponse);

  const renderGptAnalysis = (gptData) => {
    const parsedData = parseData(gptData);
    if (!parsedData) return null;

    return (
      <div className="mt-4">
        <AnalysisBlock
          title="Sentiment Analysis"
          score={parsedData["Sentiment Analysis"]?.score ?? 0}
          content={
            <div>
              <p>Overall Sentiment: {parsedData["Sentiment Analysis"]?.overall_sentiment}</p>
              <p>Comments: {parsedData["Sentiment Analysis"]?.comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Clarity and Coherence"
          score={parsedData["Clarity and Coherence"]?.score ?? 0}
          content={
            <div>
              <p>Clarity: {parsedData["Clarity and Coherence"]?.clarity}</p>
              <p>Coherence: {parsedData["Clarity and Coherence"]?.coherence}</p>
              <p>Comments: {parsedData["Clarity and Coherence"]?.comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Tone Analysis"
          score={parsedData["Tone Analysis"]?.score ?? 0}
          content={
            <div>
              <p>Tone: {parsedData["Tone Analysis"]?.tone}</p>
              <p>Comments: {parsedData["Tone Analysis"]?.comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Language and Grammar"
          score={parsedData["Language and Grammar"]?.score ?? 0}
          content={
            <div>
              <p>Errors Found: {parsedData["Language and Grammar"]?.errors_found?.join(', ')}</p>
              <p>Suggestions: {parsedData["Language and Grammar"]?.suggestions?.join(', ')}</p>
              <p>Language Professionalism: {parsedData["Language and Grammar"]?.language_professionalism}</p>
              <p>Readability: {parsedData["Language and Grammar"]?.readability}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Engagement"
          score={parsedData["Engagement"]?.score ?? 0}
          content={
            <div>
              <p>Engaging: {parsedData["Engagement"]?.engaging}</p>
              <p>Comments: {parsedData["Engagement"]?.comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Improved Text"
          content={<div><p>{parsedData["Improved Text"]?.text}</p></div>}
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
            score={parsedData.summary[key] ?? 0}
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

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto py-16 px-4 mt-16 max-w-7xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold leading-tight" style={{ color: '#3F3F3F', marginBottom: '20px' }}>
            Analysis Results
          </h2>
          
          <p className="text-lg font-thin" style={{ color: '#747474' }}>
            Detailed feedback on your speech and body language
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg w-full">
          {audioResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Your Result:</h3>
              <div className="flex flex-col items-center" style={{marginTop:'40px'}}>
                <OverallScore score={speechScore} />
                
              </div>
              <pre className="bg-gray-100 p-6 rounded text-gray-800 pre-wrap w-full mt-8">{audioResponse.results.openai.text}</pre>
              {gptResponse && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">GPT Analysis</h3>
                  {renderGptAnalysis(gptResponse)}
                </div>
              )}
            </div>
          )}

          {videoResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Body Language Analysis:</h3>
              {renderBodyLanguageAnalysis(videoResponse.description)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
