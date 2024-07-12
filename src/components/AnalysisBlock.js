import React, { useState } from 'react';

const AnalysisBlock = ({ title, score, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleOpen}>
        <h4 className="text-lg font-semibold">{title}</h4>
        <span className="text-gray-600">{score}</span>
      </div>
      {isOpen && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default AnalysisBlock;
