import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Alert } from "@heroui/react";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;
  
  return (
    <Alert
      variant="flat"
      color="danger"
      className="mb-6"
      startContent={<ExclamationCircleIcon className="h-5 w-5" />}
    >
      {message}
    </Alert>
  );
} 