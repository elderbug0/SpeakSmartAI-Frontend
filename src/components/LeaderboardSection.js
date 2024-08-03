import React from 'react';

function LeaderboardSection({ score, language }) {
  const getPercentile = (score) => {
    if (score >= 90) return 5;
    if (score >= 80) return 10;
    if (score >= 70) return 30;
    if (score >= 50) return 60;
    return 100;
  };

  const percentile = getPercentile(score);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg max-w-xs mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-indigo-800">
        {language === 'ru' ? 'Рейтинг' : 'Leaderboard'}
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#B3C7F9" // Changed to a light blue color
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="3"
              strokeDasharray={`${percentile}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-3xl font-bold text-indigo-600">{percentile}%</span>
          </div>
        </div>
        <p className="text-sm text-center text-indigo-800">
          {language === 'ru' ? 'Вы в топе' : 'You are in the top'}
          <span className="font-bold mx-1">{percentile}%</span>
          {language === 'ru' ? 'пользователей' : 'of users'}
        </p>
      </div>
    </div>
  );
}

export default LeaderboardSection;
