'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';
import Link from 'next/link';
import DashboardHeader from '@/components/admin/DashboardHeader';
import ErrorAlert from '@/components/admin/ErrorAlert';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import SearchFilter from '@/components/admin/SearchFilter';
import QuestionList from '@/components/admin/QuestionList';

export default function UnansweredQuestionsPage() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailFilter, setEmailFilter] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
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
        
        // Fetch unanswered questions
        const { data, error: fetchError } = await supabase
          .from('unanswered_questions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fetchError) throw fetchError;
        
        setQuestions(data || []);
        setFilteredQuestions(data || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to fetch unanswered questions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  // Filter questions based on search query and filters
  useEffect(() => {
    let result = [...questions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q => 
        q.processed_question.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(q => q.status === statusFilter);
    }
    
    // Apply email filter
    if (emailFilter === 'with_email') {
      result = result.filter(q => q.email !== null && q.email !== undefined);
    } else if (emailFilter === 'without_email') {
      result = result.filter(q => q.email === null || q.email === undefined);
    } else if (emailFilter === 'email_sent') {
      result = result.filter(q => q.answer_sent);
    } else if (emailFilter === 'email_not_sent') {
      result = result.filter(q => q.email && !q.answer_sent);
    }
    
    setFilteredQuestions(result);
  }, [questions, searchQuery, statusFilter, emailFilter]);

  const handleMarkAsAdded = async (id: number) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Missing Supabase environment variables');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: updateError } = await supabase
        .from('unanswered_questions')
        .update({ status: 'added_to_kb' })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === id ? { ...q, status: 'added_to_kb' } : q
        )
      );
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question status');
    }
  };

  const handleMarkAnswerSent = async (id: number) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseKey) {
        setError('Missing Supabase environment variables');
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: updateError } = await supabase
        .from('unanswered_questions')
        .update({ answer_sent: true })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === id ? { ...q, answer_sent: true } : q
        )
      );
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update answer sent status');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      <DashboardHeader 
        title="Unanswered Questions" 
        buttonText=""
        buttonLink=""
      />
      
      {error && <ErrorAlert message={error} />}
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <SearchFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            emailFilter={emailFilter}
            setEmailFilter={setEmailFilter}
          />
          
          <QuestionList 
            questions={filteredQuestions}
            onMarkAsAdded={handleMarkAsAdded}
            onMarkAnswerSent={handleMarkAnswerSent}
          />
        </div>
      )}
    </div>
  );
} 