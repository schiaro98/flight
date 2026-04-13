import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md' }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-blue-500 border-t-transparent ${sizeClasses[size]}`}
    />
  );
};

export default LoadingSpinner;
