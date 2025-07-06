
import React from 'react';

const StockIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M8.25 21V3m8.25 18V3M3.75 8.25h16.5m-16.5 4.5h16.5" />
  </svg>
);

export default StockIcon;
