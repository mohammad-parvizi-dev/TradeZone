import React from 'react';

const ArrowDownIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6-6m-6 6l-6-6" />
  </svg>
);

export default ArrowDownIcon;
