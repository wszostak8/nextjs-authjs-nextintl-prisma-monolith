import React from 'react';

interface LoadingSpinnerProps {
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = '' }) => {
    return (
        <svg
            className={`animate-spin text-current ${className}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="60 20"
            />
        </svg>
    );
};

export default LoadingSpinner;