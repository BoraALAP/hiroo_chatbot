import React from 'react';
import { Chip } from "@heroui/react";

interface QuestionStatusBadgeProps {
  status: string;
}

export default function QuestionStatusBadge({ status }: QuestionStatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Chip color="warning" variant="flat" size="sm">
          Pending
        </Chip>
      );
    case 'added_to_kb':
      return (
        <Chip color="success" variant="flat" size="sm">
          Added to KB
        </Chip>
      );
    case 'answer_sent':
      return (
        <Chip color="primary" variant="flat" size="sm">
          Answer Sent
        </Chip>
      );
    default:
      return (
        <Chip color="default" variant="flat" size="sm">
          {status}
        </Chip>
      );
  }
} 