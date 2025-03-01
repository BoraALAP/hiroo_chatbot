'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UnansweredQuestion, markQuestionAddedToKB } from '@/utils/unansweredQuestions';

export default function UnansweredQuestionsPage() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const { data, error } = await supabase
          .from('unanswered_questions')
          .select('*')
          .order('created_at', { ascending: false });

          
          
        
        if (error) {
          throw error;
        }
        
        setQuestions(data || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to fetch unanswered questions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  const handleMarkAsAdded = async (questionId: number) => {
    try {
      const success = await markQuestionAddedToKB(questionId);
      
      if (success) {
        // Update the local state
        setQuestions(questions.map(q => 
          q.id === questionId 
            ? { ...q, status: 'added_to_kb' as const } 
            : q
        ));
      } else {
        setError('Failed to update question status');
      }
    } catch (err) {
      console.error('Error marking question as added:', err);
      setError('Failed to update question status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Pending</span>;
      case 'reviewed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Reviewed</span>;
      case 'added_to_kb':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Added to KB</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  const getReasonableBadge = (isReasonable: boolean | undefined) => {
    if (isReasonable === undefined) return null;
    
    return isReasonable 
      ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Reasonable</span>
      : <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Not Reasonable</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Unanswered Questions</h1>
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-gray-800">No unanswered questions found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">ID</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Question</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Processed Question</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Assessment</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Reason</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Status</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Created At</th>
                <th className="py-2 px-4 border-b text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-900">{question.id}</td>
                  <td className="py-2 px-4 border-b text-gray-900">{question.processed_question}</td>
                  
                  <td className="py-2 px-4 border-b text-gray-900">
                    {getReasonableBadge(question.is_reasonable)}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-900">{question.reason || '-'}</td>
                  <td className="py-2 px-4 border-b text-gray-900">
                    {getStatusBadge(question.status)}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-900">
                    {new Date(question.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-900">
                    {question.status !== 'added_to_kb' && (
                      <button
                        onClick={() => handleMarkAsAdded(question.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Mark as Added
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 