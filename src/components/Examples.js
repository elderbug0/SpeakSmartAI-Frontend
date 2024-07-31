import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const examplesEn = [
  { id: 'steve_jobs', name: 'Steve Jobs', preview: 'Innovation distinguishes between a leader and a follower...' },
  { id: 'elon_musk', name: 'Elon Musk', preview: 'When something is important enough, you do it even if...' },
  { id: 'mark_zukerberg', name: 'Mark Zuckerberg', preview: 'The biggest risk is not taking any risk...' }
];

const examplesRu = [
  { id: 'steve_jobs_ru', name: 'Стив Джобс', preview: 'Инновации отличают лидера от последователя...' },
  { id: 'elon_musk_ru', name: 'Илон Маск', preview: 'Когда что-то важно, вы делаете это, даже если...' },
  { id: 'mark_zukerberg_ru', name: 'Марк Цукерберг', preview: 'Самый большой риск - не рисковать...' }
];

function Examples({ language }) {
  const navigate = useNavigate();

  const handleExampleClick = (exampleId) => {
    navigate(`/results_example/${exampleId}`);
  };

  const examples = language === 'ru' ? examplesRu : examplesEn;

  return (
    <div className="examples py-20">
      <h2 className="text-center text-3xl font-bold text-gray-800 mb-12">Examples</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mx-auto w-11/12 lg:w-9/12">
        {examples.map((example) => (
          <div
            key={example.id}
            className="example-card p-6 border rounded-xl shadow-md cursor-pointer flex justify-between items-center bg-white transition-transform transform hover:scale-105"
            onClick={() => handleExampleClick(example.id)}
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{example.name}</h3>
              <p className="text-sm text-gray-600">{example.preview}</p>
            </div>
            <FaArrowRight className="text-2xl text-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Examples;
