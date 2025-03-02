import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  color: string;
}

export default function StatsCard({ title, value, color }: StatsCardProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-lg shadow-md border border-gray-900">
      <h2 className="text-sm font-medium text-gray-400 mb-2">
        {title}
      </h2>
      <div className={`text-[64px] font-bold text-${color}-400`}>{value}</div>
    </div>
  );
} 