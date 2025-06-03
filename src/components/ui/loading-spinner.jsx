// components/ui/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ 
  size = 24, 
  className = "", 
  message = 'Loading...', 
  overlay = false 
}) {
  const baseClasses = 'flex flex-col items-center justify-center gap-2';
  const overlayClasses = overlay ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm' : '';
  const combinedClasses = `${baseClasses} ${overlayClasses} ${className}`;

  return (
    <div className={combinedClasses}>
      <svg
        className="animate-spin text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={size}
        height={size}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {message && <p className="text-sm text-muted-foreground animate-pulse">{message}</p>}
    </div>
  );
}

