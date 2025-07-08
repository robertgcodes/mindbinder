import React, { useEffect } from 'react';

const ScrollableLayout = ({ children }) => {
  useEffect(() => {
    // Enable scrolling for this layout
    document.body.style.overflow = 'auto';
    
    // Cleanup: restore overflow hidden when component unmounts
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

export default ScrollableLayout;