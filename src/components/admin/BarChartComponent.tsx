import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface BarChartComponentProps {
  data: ChartData[];
  title: string;
}

export default function BarChartComponent({ data, title }: BarChartComponentProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                borderColor: '#374151',
                color: '#F9FAFB'
              }} 
            />
            {data.map((entry, index) => (
              <Bar 
                key={`bar-${index}`}
                dataKey="value" 
                fill={entry.color} 
                name={entry.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 