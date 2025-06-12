import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="w-full h-full bg-dark-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );
};

export default LoadingSpinner;