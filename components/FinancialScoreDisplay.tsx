import React from 'react';

// You can pass the score and trend as props to make this component dynamic
interface FinancialScoreDisplayProps {
  score: number;
  trend: number;
  status: string;
}

export const FinancialScoreDisplay: React.FC<FinancialScoreDisplayProps> = ({
  score = 78,
  trend = 5,
  status = 'Good',
}) => {
  // Calculate the circumference of the circle for the SVG stroke animation
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 font-sans antialiased">
      <div className="relative w-72 h-72 md:w-120 md:h-120">
        {/* Background Circle */}
        <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 250 250">
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="#e5e7eb" // A light gray background for the track
            strokeWidth="20"
            fill="none"
          />
        </svg>

        {/* Foreground (Progress) Circle with Gradient */}
        <svg className="absolute inset-0 transform -rotate-90" width="100%" height="100%" viewBox="0 0 250 250">
           <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#4f39f6" />
            </linearGradient>
          </defs>
          <circle
            cx="125"
            cy="125"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Content inside the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-medium text-gray-500">WealthScore</span>
          <span
            className="font-bold text-gray-800"
            style={{ fontSize: '8rem', lineHeight: '1' }}
          >
            {score}
          </span>
          <div className="flex flex-col items-center space-x-1">
            <span className="text-3xl font-semibold text-purple-600">
              {status}
            </span>
             <span className="text-lg font-medium text-gray-400">
              ({trend > 0 ? `+${trend}` : trend} pts this month )
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};