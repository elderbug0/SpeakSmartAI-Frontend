import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import i18n from './i18n';
import Chart from 'chart.js/auto';

const generateRandomScores = () => {
  let scores = [];
  for (let i = 0; i < 10; i++) {
    scores.push(Math.floor(Math.random() * (90 - 50 + 1)) + 50);
  }
  return scores;
};

function Dashboard() {
  const [scores] = useState(generateRandomScores());
  const averageScore = 80;
  const [language, setLanguage] = useState('ru');

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    i18n.changeLanguage(event.target.value);
  };

  const barData = {
    labels: Array.from({ length: 10 }, (_, i) => (language === 'ru' ? `Оценка ${i + 1}` : `Score ${i + 1}`)),
    datasets: [
      {
        label: language === 'ru' ? 'Общий балл' : 'Overall Score',
        data: scores,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;

          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
          gradient.addColorStop(1, 'rgba(54, 162, 235, 0.6)');

          return gradient;
        },
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: [language === 'ru' ? 'Средний балл' : 'Average Score', language === 'ru' ? 'Остаток' : 'Remaining'],
    datasets: [
      {
        data: [averageScore, 100 - averageScore],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(211, 211, 211, 0.3)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(211, 211, 211, 0.3)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    layout: {
      padding: {
        bottom: 30,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeOutCubic',
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        footerFont: { size: 12 },
      },
      legend: {
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    rotation: -90,
    circumference: 180,
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        footerFont: { size: 12 },
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <>
      <header className="w-full bg-gray-100 fixed top-0 left-0 right-0 z-10 shadow">
        <div className="w-full mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#3F3F3F' }}>
            {language === 'ru' ? 'Speak Smart AI' : 'Dashboard'}
          </h1>
          <div className="flex items-center">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-blue-500 text-white font-bold border border-blue-700 rounded-md px-4 py-3 text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minWidth: '150px' }}
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </header>
      <div className="p-4 pt-20">
        <h2 className="text-2xl font-bold mb-4">{language === 'ru' ? 'Панель управления' : 'Dashboard'}</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="w-full md:w-1/2 lg:w-5/12 h-96 bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{language === 'ru' ? 'Общий балл' : 'Overall Score'}</h3>
            <Bar data={barData} options={barOptions} />
          </div>
          <div className="w-full md:w-1/2 lg:w-5/12 h-96 bg-white p-4 rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-2">{language === 'ru' ? 'Средний балл' : 'Average Score'}</h3>
            <div className="relative w-64 h-64">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold">
                {averageScore}
                <div className="text-base">{language === 'ru' ? 'Из 100' : 'out of 100'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
          <h3 className="text-xl font-semibold mb-2">{language === 'ru' ? 'Персонализированные советы' : 'Personalized Tips'}</h3>
          <p>{language === 'ru' ? 'На основании вашей недавней успеваемости попробуйте улучшить зрительный контакт и разнообразить тон голоса для лучшего взаимодействия.' : 'Based on your recent performance, try to improve your eye contact and vary your vocal tone for better engagement.'}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-2">{language === 'ru' ? 'Профиль' : 'Profile'}</h3>
          <p><strong>{language === 'ru' ? 'Имя' : 'Name'}:</strong> Асабай Бейбарыс</p>
          <p><strong>{language === 'ru' ? 'Всего загружено видео' : 'Total Videos Uploaded'}:</strong> 15</p>
          <p><strong>{language === 'ru' ? 'Средний балл' : 'Average Score'}:</strong> 80</p>
          <p><strong>{language === 'ru' ? 'Достижения' : 'Achievements'}:</strong> {language === 'ru' ? 'Завершено 10 видео с баллом выше 80' : 'Completed 10 videos with a score above 80'}</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
