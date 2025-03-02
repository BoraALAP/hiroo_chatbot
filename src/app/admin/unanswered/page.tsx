'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UnansweredQuestion, markQuestionAddedToKB, markQuestionAnswerSent } from '@/utils/unansweredQuestions';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function UnansweredQuestionsPage() {
  const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<string>('all');

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
    // Filter questions based on search query, status filter, and email filter
    let filtered = [...questions];
    
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.processed_question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(q => q.status === statusFilter);
    }
    
    if (emailFilter !== 'all') {
      if (emailFilter === 'with_email') {
        filtered = filtered.filter(q => q.email && q.email.trim() !== '');
      } else if (emailFilter === 'without_email') {
        filtered = filtered.filter(q => !q.email || q.email.trim() === '');
      } else if (emailFilter === 'answer_sent') {
        filtered = filtered.filter(q => q.answer_sent === true);
      } else if (emailFilter === 'answer_not_sent') {
        filtered = filtered.filter(q => q.email && q.email.trim() !== '' && q.answer_sent === false);
      }
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchQuery, statusFilter, emailFilter]);

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

  const handleMarkAnswerSent = async (questionId: number) => {
    try {
      const success = await markQuestionAnswerSent(questionId);
      
      if (success) {
        // Update the local state
        setQuestions(questions.map(q => 
          q.id === questionId 
            ? { ...q, answer_sent: true } 
            : q
        ));
      } else {
        setError('Failed to mark answer as sent');
      }
    } catch (err) {
      console.error('Error marking answer as sent:', err);
      setError('Failed to mark answer as sent');
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

  const getEmailBadge = (email: string | undefined, answerSent: boolean) => {
    if (!email || email.trim() === '') {
      return <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">No Email</span>;
    }
    
    if (answerSent) {
      return <span className="bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded text-xs border border-emerald-800">Answer Sent</span>;
    }
    
    return <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs border border-blue-800">Email Provided</span>;
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
            
            <div className="flex flex-col sm:flex-row gap-2">
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
              
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-700 text-gray-100"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              >
                <option value="all">All Email Status</option>
                <option value="with_email">With Email</option>
                <option value="without_email">Without Email</option>
                <option value="answer_sent">Answer Sent</option>
                <option value="answer_not_sent">Awaiting Response</option>
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
                      Email Status
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
                        {question.email && (
                          <div className="text-xs text-gray-400 mt-1 flex items-center">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            {question.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getReasonableBadge(question.is_reasonable)}
                        <div className="text-xs text-gray-400 mt-1 max-w-xs">{question.reason || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEmailBadge(question.email, question.answer_sent)}
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
                        <div className="flex flex-col gap-2">
                          {question.status !== 'added_to_kb' && (
                            <button
                              onClick={() => handleMarkAsAdded(question.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-[#00015E] hover:bg-[#00017E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition ease-in-out duration-150"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Mark as Added
                            </button>
                          )}
                          
                          {question.email && !question.answer_sent && (
                            <button
                              onClick={() => handleMarkAnswerSent(question.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-emerald-800 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition ease-in-out duration-150"
                            >
                              <EnvelopeIcon className="h-4 w-4 mr-1" />
                              Mark Answer Sent
                            </button>
                          )}
                        </div>
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