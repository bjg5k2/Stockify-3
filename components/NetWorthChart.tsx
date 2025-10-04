
import React from 'react';
import { NetWorthHistoryPoint, FollowerHistoryPoint } from '../types';
import Chart from './Chart';

interface NetWorthChartProps {
  data: NetWorthHistoryPoint[];
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data }) => {
  // The Chart component expects data in FollowerHistoryPoint format.
  // We can map our NetWorthHistoryPoint data to fit this structure.
  const chartData: FollowerHistoryPoint[] = data.map(point => ({
    date: point.date,
    count: point.netWorth, // Use net worth as the 'count' for the chart
  }));

  return <Chart data={chartData} />;
};

export default NetWorthChart;
