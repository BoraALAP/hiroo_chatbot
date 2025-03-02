'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';

export interface Stats {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  addedToKb: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface AdminContextType {
  stats: Stats;
  recentUnanswered: UnansweredQuestion[];
  pieChartData: ChartData[];
  barChartData: ChartData[];
  loading: boolean;
  error: string | null;
}

export const AdminContext = createContext<AdminContextType>({
  stats: {
    totalQuestions: 0,
    answeredQuestions: 0,
    pendingQuestions: 0,
    addedToKb: 0
  },
  recentUnanswered: [],
  pieChartData: [],
  barChartData: [],
  loading: true,
  error: null
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    pendingQuestions: 0,
    addedToKb: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUnanswered, setRecentUnanswered] = useState<UnansweredQuestion[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setError('Missing Supabase environment variables');
          setLoading(false);
          return;
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Fetch total questions count
        const { count: totalCount, error: totalError } = await supabase
          .from('unanswered_questions')
          .select('*', { count: 'exact', head: true });
        
        if (totalError) throw totalError;
        
        // Fetch pending questions count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('unanswered_questions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
        
        // Fetch added to KB questions count
        const { count: addedCount, error: addedError } = await supabase
          .from('unanswered_questions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'added_to_kb');
        
        if (addedError) throw addedError;
        
        // Fetch recent unanswered questions
        const { data: recentData, error: recentError } = await supabase
          .from('unanswered_questions')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentError) throw recentError;
        
        setRecentUnanswered(recentData || []);
        
        // Calculate stats
        const totalQuestions = totalCount || 0;
        const pendingQuestions = pendingCount || 0;
        const addedToKb = addedCount || 0;
        const answeredQuestions = 0; // Initialize answeredQuestions with a default value
        
        setStats({
          totalQuestions,
          answeredQuestions,
          pendingQuestions,
          addedToKb
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Prepare chart data
  const pieChartData = [
    { name: 'Added to KB', value: stats.addedToKb, color: '#10B981' },
    { name: 'Pending', value: stats.pendingQuestions, color: '#F59E0B' }
  ];

  const barChartData = [
    { name: 'Total', value: stats.totalQuestions, color: '#3B82F6' },
    { name: 'Pending', value: stats.pendingQuestions, color: '#F59E0B' },
    { name: 'Added to KB', value: stats.addedToKb, color: '#10B981' }
  ];

  return (
    <AdminContext.Provider 
      value={{ 
        stats, 
        recentUnanswered, 
        pieChartData, 
        barChartData, 
        loading, 
        error 
      }}
    >
      {children}
    </AdminContext.Provider>
  );
} 