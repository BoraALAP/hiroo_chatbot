'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UnansweredQuestion, markQuestionAddedToKB } from '@/utils/unansweredQuestions';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function UnansweredQuestionsPage() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  useEffect(() => {
    // Filter questions based on search query and status filter
    let filtered = [...questions];
    
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.processed_question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchQuery, statusFilter]);

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
        return <span className="bg-amber-900/30 text-amber-300 px-2 py-1 rounded text-xs border border-amber-800">Pending</span>;
      case 'reviewed':
        return <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs border border-blue-800">Reviewed</span>;
      case 'added_to_kb':
        return <span className="bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-800">Added to KB</span>;
      default:
        return <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">{status}</span>;
    }
  };

  const getReasonableBadge = (isReasonable: boolean | undefined) => {
    if (isReasonable === undefined) return null;
    
    return isReasonable 
      ? <span className="bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-800">Reasonable</span>
      : <span className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs border border-red-800">Not Reasonable</span>;
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin" 
            className="mr-4 text-gray-400 hover:text-gray-200"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Unanswered Questions</h1>
        </div>
        
        {error && (
          <div className="mb-6 border border-red-800 bg-red-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-300">
              <ExclamationCircleIcon className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="added_to_kb">Added to KB</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-gray-700 p-6 rounded text-center border border-gray-600">
              <p className="text-gray-300">No questions found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Question
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm font-medium text-gray-200">{question.processed_question}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getReasonableBadge(question.is_reasonable)}
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-400 max-w-xs">{question.reason || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(question.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-400">
                          {new Date(question.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(question.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {question.status !== 'added_to_kb' ? (
                          <button
                            onClick={() => handleMarkAsAdded(question.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-[#00015E] hover:bg-[#00017E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Mark as Added
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">Already added</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 