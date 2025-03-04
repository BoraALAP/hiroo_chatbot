import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardBody } from "@heroui/react";

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
  // Default colors if none provided in the data
  const defaultColors = [
    "#b6e7c7", // primary-200
    "#d1f0dc", // primary-100
    "#95c7ab", // primary-300
    "#82b395", // primary-400
    "#6fa380", // primary-500
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <h2 className="text-lg font-semibold">{title}</h2>
      </CardHeader>
      <CardBody>
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
              <CartesianGrid strokeDasharray="3 3" className="stroke-default-200" />
              <XAxis dataKey="name" className="fill-default-500" />
              <YAxis className="fill-default-500" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--default-200)',
                  color: 'var(--foreground)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
} 