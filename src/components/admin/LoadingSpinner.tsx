import React from 'react';
import { Spinner } from "@heroui/react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <Spinner 
        size="lg" 
        color="primary" 
        labelColor="primary"
        label="Loading dashboard data..."
      />
    </div>
  );
} 