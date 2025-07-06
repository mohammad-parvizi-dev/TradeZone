import React from 'react';

const PauseIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export default PauseIcon;
