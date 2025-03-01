'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';

// Using standard Tailwind classes instead of HeroUI components
// since HeroUI package seems to have import issues
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  ChevronRightIcon, 
  ClipboardIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalQuestions: number;
  
  unansweredQuestions: number;
  pendingQuestions: number;
  addedToKbQuestions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
  
    unansweredQuestions: 0,
    pendingQuestions: 0,
    addedToKbQuestions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentUnanswered, setRecentUnanswered] = useState<UnansweredQuestion[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

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
        const addedToKbQuestions = addedCount || 0;
        
        setStats({
          totalQuestions,
          unansweredQuestions: pendingQuestions,
          pendingQuestions,
          addedToKbQuestions
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
    { name: 'Added to KB', value: stats.addedToKbQuestions, color: '#10B981' },
    { name: 'Pending', value: stats.pendingQuestions, color: '#F59E0B' }
  ];

  const barChartData = [
    { name: 'Total', value: stats.totalQuestions, color: '#3B82F6' },
    { name: 'Pending', value: stats.pendingQuestions, color: '#F59E0B' },
    { name: 'Added to KB', value: stats.addedToKbQuestions, color: '#10B981' }
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <Link 
            href="/admin/unanswered"
            className="bg-[#00015E] hover:bg-[#00017E] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View All Unanswered Questions
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 border border-red-800 bg-red-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-300">
              <ExclamationCircleIcon className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="border-b border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "overview"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === "analytics"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    Analytics
                  </button>
                </nav>
              </div>
              
              {activeTab === "overview" && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-sm font-medium text-gray-400 mb-2">
                        Total Questions
                      </h2>
                      <div className="text-3xl font-bold text-blue-400">{stats.totalQuestions}</div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-sm font-medium text-gray-400 mb-2">
                        Pending Questions
                      </h2>
                      <div className="text-3xl font-bold text-amber-400">{stats.pendingQuestions}</div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-sm font-medium text-gray-400 mb-2">
                        Added to KB
                      </h2>
                      <div className="text-3xl font-bold text-emerald-400">{stats.addedToKbQuestions}</div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-sm font-medium text-gray-400 mb-2">
                        Response Rate
                      </h2>
                      <div className="text-3xl font-bold text-indigo-400">
                        {stats.totalQuestions > 0 
                          ? `${Math.round((stats.addedToKbQuestions / stats.totalQuestions) * 100)}%` 
                          : '0%'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Recent Unanswered Questions</h2>
                        <Link 
                          href="/admin/unanswered" 
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                        >
                          View All <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </div>
                      
                      {recentUnanswered.length === 0 ? (
                        <p className="text-gray-400">No pending questions found.</p>
                      ) : (
                        <ul className="divide-y divide-gray-700">
                          {recentUnanswered.map((question) => (
                            <li key={question.id} className="py-3">
                              <p className="font-medium text-gray-200">{question.processed_question}</p>
                              <p className="text-sm text-gray-400 mt-1">
                                {new Date(question.created_at).toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-lg font-semibold mb-2 text-white">Quick Actions</h2>
                      <p className="text-gray-400 mb-4">
                        Manage your chatbot and knowledge base
                      </p>
                      
                      <div className="grid gap-4">
                        <Link 
                          href="/admin/unanswered" 
                          className="flex items-center gap-2 w-full bg-[#00015E] hover:bg-[#00017E] text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          <ClipboardIcon className="h-5 w-5" />
                          Manage Unanswered Questions
                        </Link>
                        
                        <Link 
                          href="/" 
                          className="flex items-center gap-2 w-full bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          <ChatBubbleLeftRightIcon className="h-5 w-5" />
                          View Chatbot
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "analytics" && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-lg font-semibold mb-2 text-white">Questions Overview</h2>
                      <p className="text-gray-400 mb-4">
                        Distribution of answered vs pending questions
                      </p>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }: { name: string; percent: number }) => 
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                      <h2 className="text-lg font-semibold mb-2 text-white">Questions Metrics</h2>
                      <p className="text-gray-400 mb-4">
                        Comparison of question statuses
                      </p>
                      
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barChartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
                            <Bar dataKey="value" name="Count">
                              {barChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 