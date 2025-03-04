import React from 'react';
import { UnansweredQuestion } from '@/utils/unansweredQuestions';
import QuestionStatusBadge from './QuestionStatusBadge';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Card, CardBody,  Divider, Chip } from "@heroui/react";
import { MyButton } from '../ui/button';

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
  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-default-500">No questions found matching your criteria.</p>
          </CardBody>
        </Card>
      ) : (
        questions.map((question) => (
          <Card key={question.id} className="overflow-hidden bg-zinc-900">
            <CardBody>
              <div className="flex flex-col gap-2 p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">{question.processed_question}</h3>
                  <div className="flex gap-2">
                    <QuestionStatusBadge status={question.status} />
                    
                  </div>
                </div>
                
                <p className="text-default-600 text-sm">{question.reason || 'No additional context'}</p>
                {question.email && (
                  <p className="text-default-800 text-sm">
                    <span className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {question.email}
                    </span>
                  </p>
                )}
                
                <Divider className="my-2" />
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-1 items-center gap-2 justify-between">
                    <span className="text-xs text-default-500">
                      {new Date(question.created_at).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                    {question.answer_sent && (
                      <Chip color="success" variant="flat" size="sm">
                        <span className="flex items-center">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          Email Sent
                        </span>
                      </Chip>
                    )}
                 
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {question.status !== 'added_to_kb' && (
                      <MyButton
                        size="sm"
                        color="primaryCustom"
                        variant="shadow"
                        startContent={<CheckCircleIcon className="h-4 w-4" />}
                        onClick={() => onMarkAsAdded(question.id)}
                      >
                        Mark as Added
                      </MyButton>
                    )}
                    
                    {question.email && !question.answer_sent && (
                      <MyButton
                        size="sm"
                        
                        variant="flat"
                        startContent={<EnvelopeIcon className="h-4 w-4" />}
                        onClick={() => onMarkAnswerSent(question.id)}
                      >
                        Mark Answer Sent
                      </MyButton>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
} 