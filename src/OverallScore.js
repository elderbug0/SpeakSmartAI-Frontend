import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const OverallScore = ({ score, language }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const increment = score / (animationDuration / 10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= score) {
          clearInterval(interval);
          return score;
        }
        return prev + increment;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [score]);

  const getColor = (score) => {
    if (score <= 20) return '#ff4d4d'; // Red
    if (score <= 50) return '#ffbb33'; // Orange
    if (score <= 75) return '#ffeb3b'; // Yellow
    return '#4caf50'; // Green
  };

  const getFeedback = (score) => {
    if (language === 'ru') {
      if (score <= 20) return 'Этот результат не очень хороший. Вам следует больше тренироваться, чтобы значительно улучшить свои навыки.';
      if (score <= 50) return 'Этот результат справедливый. У вас есть некоторые области, которые нуждаются в улучшении. Продолжайте работать над своими навыками.';
      if (score <= 80) return 'Этот результат хороший. Вы делаете успехи, но еще есть куда расти.';
      return 'Этот результат отличный. Отличная работа! Вы продемонстрировали сильные навыки.';
    } else {
      if (score <= 20) return 'This score is not that good. You should train more to improve your skills significantly.';
      if (score <= 50) return 'This score is fair. You have some areas that need improvement. Keep working on your skills.';
      if (score <= 80) return 'This score is good. You are doing well, but there is still room for improvement.';
      return 'This score is excellent. Great job! You have demonstrated strong skills.';
    }
  };

  const color = getColor(score);
  const feedback = getFeedback(score);

  return (
    <div className="text-center">
      <div className="mx-auto" style={{ width: '220px' }}>
        <CircularProgressbar
          value={progress}
          text={`${Math.round(progress)}%`}
          circleRatio={0.5}
          styles={buildStyles({
            rotation: 0.75,
            textColor: '#000',
            pathColor: color,
            trailColor: '#d6d6d6',
          })}
        />
      </div>
      <div style={{ marginTop: '-40px' }} className="text-left">
        <p className="text-black">{feedback}</p>
      </div>
    </div>
  );
};

export default OverallScore;
