
import React from 'react';

const ChartIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-1.097-2.47m1.097 2.47a23.51 23.51 0 01-4.136-2.162m-1.263 8.86l-4.25-4.25" />
  </svg>
);

export default ChartIcon;
