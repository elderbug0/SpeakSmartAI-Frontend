import React, { useState } from 'react';

const getColorByScore = (score) => {
  if (score >= 0 && score <= 4) return 'bg-red-500';
  if (score >= 5 && score <= 7) return 'bg-yellow-500';
  if (score >= 8 && score <= 10) return 'bg-green-500';
  return 'bg-gray-500'; // fallback color
};

const AnalysisBlock = ({ title, score, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="bg-white rounded-3xl shadow p-4 my-4">
      <div className="flex flex-col md:flex-row justify-between items-center cursor-pointer" onClick={toggleOpen}>
        <div className="flex items-center">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mr-2">{title}</h3>
          <svg
            className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
        {score !== undefined && (
          <div className="flex flex-col md:flex-row items-center mt-2 md:mt-0">
            <span className="text-sm text-gray-500 mb-1 md:mb-0">{score}/10</span>
            <div className="relative w-24 md:w-48 h-4 bg-gray-200 rounded-full overflow-hidden ml-0 md:ml-2">
              <div className={`absolute h-full ${getColorByScore(score)}`} style={{ width: `${score * 10}%` }}></div>
            </div>
          </div>
        )}
      </div>
      {isOpen && <div className="mt-2 text-gray-600">{content}</div>}
    </div>
  );
};

export default AnalysisBlock;
