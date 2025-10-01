import React, { useMemo } from 'react';

interface ChartDataPoint {
  count: number;
}
interface ChartProps {
  data: ChartDataPoint[];
  className?: string;
  strokeColor?: string;
  gradientColor?: string;
}

const Chart: React.FC<ChartProps> = ({ data, className, strokeColor = '#4ade80', gradientColor = '#4ade80' }) => {
  if (!data || data.length < 2) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-900/50 rounded-lg text-gray-400 ${className}`}>
        Not enough data for chart.
      </div>
    );
  }

  // Use a unique ID for the gradient per chart instance to avoid color conflicts
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substring(2, 9)}`, []);
  const filterId = useMemo(() => `glow-${Math.random().toString(36).substring(2, 9)}`, []);

  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 10; 

  const values = data.map(d => d.count);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  const getX = (index: number) => {
    return (index / (data.length - 1)) * (chartWidth - padding * 2) + padding;
  };

  const getY = (value: number) => {
    if (range === 0) {
        return chartHeight / 2;
    }
    return chartHeight - ((value - minVal) / range) * (chartHeight - padding * 2) - padding;
  };

  const path = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.count);
    return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  const areaPath = `${path} L ${getX(data.length - 1)},${chartHeight - padding} L ${getX(0)},${chartHeight - padding} Z`;

  return (
    <div className={`w-full h-48 bg-gray-900/50 p-2 rounded-lg ${className}`}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                </linearGradient>
                <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
            </defs>
            <path
                d={areaPath}
                fill={`url(#${gradientId})`}
            />
            <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `url(#${filterId})` }}
            />
        </svg>
    </div>
  );
};

export default Chart;