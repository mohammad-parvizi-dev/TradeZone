
import React from 'react';

const SubItemIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export default SubItemIcon;
