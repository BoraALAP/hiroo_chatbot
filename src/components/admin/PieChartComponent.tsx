import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Card, CardHeader, CardBody } from "@heroui/react";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartComponentProps {
  data: ChartData[];
  title: string;
}

export default function PieChartComponent({ data, title }: PieChartComponentProps) {
  // Default colors if none provided in the data
  const defaultColors = [
    "#b6e7c7", // primary-200
    "#d1f0dc", // primary-100
    "#95c7ab", // primary-300
    "#82b395", // primary-400
    "#6fa380", // primary-500
    "#5f9070", // primary-600
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardBody>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--default-200)',
                  color: 'var(--foreground)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend formatter={(value) => <span className="text-default-700">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
} 