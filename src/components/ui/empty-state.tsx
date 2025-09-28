import React from 'react';

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="rounded-lg border bg-white p-6 text-center text-slate-500">
    {message}
  </div>
);

export default EmptyState;
