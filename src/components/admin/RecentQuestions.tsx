import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';
import { Card, CardHeader, CardBody, Avatar } from "@heroui/react";

interface RecentQuestionsProps {
  questions: UnansweredQuestion[];
}

export default function RecentQuestions({ questions }: RecentQuestionsProps) {
  return (
    <Card className="">
      <CardHeader className="flex justify-between items-center px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Recent Unanswered Questions</h2>
        <Link 
          href="/admin/unanswered" 
          className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1"
        >
          View All <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </CardHeader>
      
      <CardBody className="px-6 py-2">
        {questions.length === 0 ? (
          <div className="py-8 text-center">
            <ClockIcon className="h-12 w-12 mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400">No pending questions found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {questions.map((question) => (
              <li key={question.id} className="py-4">
                <div className="flex items-start gap-3">
                  <Avatar 
                    name={question.email || "User"} 
                    size="sm" 
                    className="bg-blue-100/10 text-blue-400"
                  />
                  <div>
                    <p className="font-medium text-gray-200">{question.processed_question}</p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {new Date(question.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
} 