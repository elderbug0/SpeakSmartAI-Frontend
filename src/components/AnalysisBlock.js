// components/AnalysisBlock.jsx
import React, { useState } from 'react';

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
      {isOpen && <div className="mt-2 text-gray-600 whitespace-pre-wrap">{content}</div>}
    </div>
  );
};

export default AnalysisBlock;
