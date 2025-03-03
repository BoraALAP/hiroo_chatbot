'use client';

import React, { useContext } from 'react';
import RecentQuestions from '@/components/admin/RecentQuestions';

import ErrorAlert from '@/components/admin/ErrorAlert';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { AdminContext } from '../../app/admin/context';
import StatsCards from './StatsCards';

export const  OverviewPage = () =>  {
  const { stats, recentUnanswered, loading, error } = useContext(AdminContext);

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      
        <StatsCards stats={stats}   />
        
      

      <div className="grid grid-cols-1  gap-6">
        
          <RecentQuestions questions={recentUnanswered} />
 
 
 
      </div>
    </div>
  );
}
