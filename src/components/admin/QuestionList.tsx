import React from 'react';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';
import QuestionStatusBadge from './QuestionStatusBadge';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface QuestionListProps {
  questions: UnansweredQuestion[];
  onMarkAsAdded: (id: number) => void;
  onMarkAnswerSent: (id: number) => void;
}

export default function QuestionList({ 
  questions, 
  onMarkAsAdded, 
  onMarkAnswerSent 
}: QuestionListProps) {
  const getReasonableBadge = (isReasonable: boolean | undefined) => {
    if (isReasonable === undefined) return null;
    
    return isReasonable ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Reasonable
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Not Reasonable
      </span>
    );
  };
  
  const getEmailBadge = (email: string | undefined, answerSent: boolean) => {
    if (!email) return null;
    
    return answerSent ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Email Sent
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {email}
      </span>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
      {questions.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No questions found matching your criteria.
        </div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {questions.map((question) => (
            <li key={question.id} className="p-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-200 mb-2">{question.processed_question}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <QuestionStatusBadge status={question.status} />
                    {getReasonableBadge(question.is_reasonable)}
                    {getEmailBadge(question.email, question.answer_sent || false)}
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(question.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {question.status !== 'added_to_kb' && (
                    <button
                      onClick={() => onMarkAsAdded(question.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Mark as Added
                    </button>
                  )}
                  {question.email && !question.answer_sent && (
                    <button
                      onClick={() => onMarkAnswerSent(question.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      Mark Answer Sent
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 