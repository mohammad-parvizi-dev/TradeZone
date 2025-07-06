
import React from 'react';

const ForexIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25l-2.5 2.5 2.5 2.5m7.5-5l2.5 2.5-2.5 2.5" />
  </svg>
);

export default ForexIcon;
