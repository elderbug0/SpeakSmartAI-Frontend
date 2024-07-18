import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header'; // Make sure the path is correct
import './styles/tailwind.css';

const AnalysisBlock = ({ title, score, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded shadow p-4 my-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleOpen}>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">Score: {score}</span>
      </div>
      {isOpen && <div className="mt-2 text-gray-600">{content}</div>}
    </div>
  );
};

const ResultsPage = () => {
  const location = useLocation();
  const { audioResponse, videoResponse, gptResponse } = location.state || {};

  const renderGptAnalysis = (gptData) => {
    if (!gptData) return null;

    const parsedData = JSON.parse(gptData);

    return (
      <div className="mt-4">
        <AnalysisBlock
          title="Sentiment Analysis"
          score={parsedData["Sentiment Analysis"].score}
          content={
            <div>
              <p>Overall Sentiment: {parsedData["Sentiment Analysis"].overall_sentiment}</p>
              <p>Comments: {parsedData["Sentiment Analysis"].comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Clarity and Coherence"
          score={parsedData["Clarity and Coherence"].score}
          content={
            <div>
              <p>Clarity: {parsedData["Clarity and Coherence"].clarity}</p>
              <p>Coherence: {parsedData["Clarity and Coherence"].coherence}</p>
              <p>Comments: {parsedData["Clarity and Coherence"].comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Tone Analysis"
          score={parsedData["Tone Analysis"].score}
          content={
            <div>
              <p>Tone: {parsedData["Tone Analysis"].tone}</p>
              <p>Comments: {parsedData["Tone Analysis"].comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Language and Grammar"
          score={parsedData["Language and Grammar"].score}
          content={
            <div>
              <p>Errors Found: {parsedData["Language and Grammar"].errors_found.join(', ')}</p>
              <p>Suggestions: {parsedData["Language and Grammar"].suggestions.join(', ')}</p>
              <p>Language Professionalism: {parsedData["Language and Grammar"].language_professionalism}</p>
              <p>Readability: {parsedData["Language and Grammar"].readability}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Engagement"
          score={parsedData["Engagement"].score}
          content={
            <div>
              <p>Engaging: {parsedData["Engagement"].engaging}</p>
              <p>Comments: {parsedData["Engagement"].comments}</p>
            </div>
          }
        />
        <AnalysisBlock
          title="Improved Text"
          score=""
          content={<div><p>{parsedData["Improved Text"].text}</p></div>}
        />
      </div>
    );
  };

  const renderBodyLanguageAnalysis = (videoData) => {
    if (!videoData) return null;

    const parsedData = JSON.parse(videoData);

    return (
      <div className="mt-4">
        {Object.keys(parsedData.details).map((key) => (
          <AnalysisBlock
            key={key}
            title={key.replace(/([A-Z])/g, ' $1').trim()} // Format the key to be more readable
            score={parsedData.summary[key]}
            content={
              <div>
                {Object.keys(parsedData.details[key]).map((detailKey) => (
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
      <div className="mx-auto py-16 px-4 mt-16">
        <h1 className="text-2xl font-bold text-gray-800">Results</h1>
        {audioResponse && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800">Audio Analysis Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-gray-800 pre-wrap">{audioResponse.results.amazon.text}</pre>
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
  );
};

export default ResultsPage;
