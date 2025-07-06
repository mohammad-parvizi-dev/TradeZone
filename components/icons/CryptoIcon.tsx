
import React from 'react';

const CryptoIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 15H14v-1.5c0-.828-.672-1.5-1.5-1.5H10.5v3zm0-3V9H14c.828 0 1.5.672 1.5 1.5V12h-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V6m0 12v1.5" />
  </svg>
);

export default CryptoIcon;
