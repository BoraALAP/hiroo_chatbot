'use client';

import React, { useContext } from 'react';
import { AdminContext } from '../../app/admin/context';
import ErrorAlert from '@/components/admin/ErrorAlert';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import BarChartComponent from '@/components/admin/BarChartComponent';
import PieChartComponent from '@/components/admin/PieChartComponent';

export const  AnalyticsPage = () =>  {
  const { pieChartData, barChartData, loading, error } = useContext(AdminContext);

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
            <PieChartComponent data={pieChartData} title="Question Status" />
        
        
        
            <BarChartComponent data={barChartData} title="Questions Overview" />
        
      </div>
      
          </div>
  );
}
