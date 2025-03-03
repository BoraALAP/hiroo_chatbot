'use client';

import React, {  useContext } from 'react';
import DashboardHeader from '@/components/admin/DashboardHeader';
import { AdminContext } from './context';

import ErrorAlert from '@/components/admin/ErrorAlert';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { Tab, Tabs } from "@heroui/react";
import { ChartBarIcon, HomeIcon } from '@heroicons/react/24/outline';
import { OverviewPage } from '@/components/admin/Overview';
import { AnalyticsPage } from '@/components/admin/Analytics';

export default function AdminDashboard() {
  const {  loading, error } = useContext(AdminContext);
 



  if (error) {
    return (
      <div className="p-6">
        <DashboardHeader 
          title="Admin Dashboard" 
          buttonText="View Unanswered"
          buttonLink="/admin/unanswered"
        />
        <div className="mt-6">
          <ErrorAlert message={error} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <DashboardHeader 
          title="Admin Dashboard" 
          buttonText="View Unanswered"
          buttonLink="/admin/unanswered"
        />
        <div className="mt-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 ">
      <DashboardHeader 
        title="Admin Dashboard" 
        buttonText="View Unanswered"
        buttonLink="/admin/unanswered"
      />
      
      <div className=" bg-gray-800 rounded-lg  overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-700">
          <Tabs 
            aria-label="Options"
          >
            <Tab
              key="overview"
              title={
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-5 w-5" />
                  <span>Overview</span>
                </div>
              }
            >
              <OverviewPage />
            </Tab>
            <Tab
              key="analytics"
              title={
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-5 w-5" />
                  <span>Analytics</span>
                </div>
              }
            >
              <AnalyticsPage />
            </Tab>
          </Tabs>
        </div>
        
        
        
      </div>
    </div>
  );
} 