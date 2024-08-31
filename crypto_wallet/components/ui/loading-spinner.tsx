// src/components/ui/loading-spinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        className="w-6 h-6 text-indigo-600 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
          d="M4 12a8 8 0 1 1 16 0A8 8 0 0 1 4 12z"
        ></path>
      </svg>
    </div>
  );
};

export default LoadingSpinner;