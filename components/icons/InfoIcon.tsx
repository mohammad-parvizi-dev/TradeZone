import React from 'react';

const InfoIcon: React.FC<{ tooltip: string, className?: string }> = ({ tooltip, className }) => (
  <div className="relative flex items-center group/tooltip" title={tooltip}>
     <svg className={`w-4 h-4 text-gray-500 ml-1.5 cursor-help ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  </div>
);

export default InfoIcon;
