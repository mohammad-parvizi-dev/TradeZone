
import React from 'react';

const GenericIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104l-2.084 2.084m2.084-2.084l2.084 2.084m-2.084-2.084v5.168m2.084 6.248l-2.084-2.084m2.084 2.084l2.084-2.084m-2.084 2.084v-5.168m-6.248 2.084l2.084-2.084m-2.084 2.084l-2.084-2.084m2.084 2.084h5.168m-4.125-6.248l2.084 2.084m-2.084-2.084l-2.084 2.084m2.084-2.084h5.168" />
  </svg>
);

export default GenericIcon;
