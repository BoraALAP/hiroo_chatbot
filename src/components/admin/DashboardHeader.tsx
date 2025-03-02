import React from 'react';
import Link from 'next/link';
import { Button } from "@heroui/react";
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderProps {
  title: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function DashboardHeader({ 
  title, 
  buttonText = "View All Unanswered Questions", 
  buttonLink = "/admin/unanswered" 
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {buttonText && buttonLink && (
        <Link href={buttonLink}>
          <Button 
            color="primary" 
            variant="solid" 
            radius="md"
            endContent={<ArrowRightIcon className="h-4 w-4" />}
            className="bg-[#00015E] hover:bg-[#00017E]"
          >
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  );
} 