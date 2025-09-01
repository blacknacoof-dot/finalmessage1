
import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  gridSpan?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '', gridSpan = 'col-span-1' }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg backdrop-blur-sm p-6 ${gridSpan} ${className}`}>
      {children}
    </div>
  );
};

export default DashboardCard;