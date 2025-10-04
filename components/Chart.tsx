import React, { useMemo } from 'react';
import { FollowerHistoryPoint } from '../types';

interface ChartProps {
  data: FollowerHistoryPoint[];
  className?: string;
}

const Chart: React.FC<ChartProps> = ({ data, className }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-900/50 rounded-lg text-gray-400 ${className}`}>
        No data to display.
      </div>
    );
  }
  
  if (data.length < 2) {
    // Render a flat line if there's only one data point
    const singleValue = data[0].count;
     return (
      <div className={`relative w-full h-48 bg-gray-900/50 p-2 rounded-lg ${className}`}>
        <svg viewBox="0 0 500 150" className="w-full h-full" preserveAspectRatio="none">
           <line x1="10" y1="75" x2="490" y2="75" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
        </svg>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-400">
             Tracking started...
         </div>
      </div>
    );
  }

  const isGrowth = data[data.length - 1].count >= data[0].count;
  const strokeColor = isGrowth ? '#4ade80' : '#f87171';
  const gradientColor = isGrowth ? '#4ade80' : '#f87171';
  
  const gradientId = useMemo(() => `chart-gradient-${Math.random().toString(36).substring(2, 9)}`, []);
  const filterId = useMemo(() => `chart-glow-${Math.random().toString(36).substring(2, 9)}`, []);

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
