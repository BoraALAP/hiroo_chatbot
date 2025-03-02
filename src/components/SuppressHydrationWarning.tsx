'use client';

import { useEffect } from 'react';

export default function SuppressHydrationWarning({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  useEffect(() => {
    // Suppress hydration warnings
    const originalConsoleError = console.error;
    console.error = function(...args: unknown[]) {
      if (args[0] && 
          typeof args[0] === 'string' && 
          (args[0].includes('Warning: Text content did not match') || 
           args[0].includes('Warning: Prop `className` did not match') ||
           args[0].includes('Warning: Expected server HTML to contain') ||
           args[0].includes('Hydration failed because'))) {
        return;
      }
      originalConsoleError.apply(console, args);
    };
    
    // Cleanup
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return <>{children}</>;
} 