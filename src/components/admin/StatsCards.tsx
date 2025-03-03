import React from 'react';
import { Card, CardBody } from "@heroui/react";
import { 
  QuestionMarkCircleIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { Stats } from '@/app/admin/context';



export default function StatsCards({ stats }: { stats: Stats }) {
  const statsCards = [
    {
      title: "Total Questions",
      value: stats.totalQuestions,
      textColor: "text-blue-400",
      icon: <QuestionMarkCircleIcon className="h-6 w-6 text-blue-400" />,
      bgColor: "bg-blue-100/10"
    },
    {
      title: "Pending Questions",
      value: stats.pendingQuestions,
      textColor: "text-yellow-400",
      icon: <ClockIcon className="h-6 w-6 text-yellow-400" />,
      bgColor: "bg-yellow-100/10"
    },
    {
      title: "Answered Questions",
      value: stats.answeredQuestions,
      textColor: "text-green-400",
      icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
      bgColor: "bg-green-100/10"
    },
    {
      title: "Added to KB",
      value: stats.addedToKb,
      textColor: "text-purple-400",
      icon: <DocumentTextIcon className="h-6 w-6 text-purple-400" />,
      bgColor: "bg-purple-100/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <Card key={index} className="">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium  mb-2">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                {card.icon}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
} 