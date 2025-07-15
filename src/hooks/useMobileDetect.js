import { useState, useEffect } from 'react';

const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Check if mobile
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Check viewport width
      const viewportWidth = window.innerWidth;
      const isMobileWidth = viewportWidth <= 768;
      const isTabletWidth = viewportWidth > 768 && viewportWidth <= 1024;
      
      // Combine both checks for better detection
      setIsMobile(isMobileDevice || isMobileWidth);
      setIsTablet(isTabletWidth);
    };

    // Initial check
    checkDevice();

    // Add resize listener
    window.addEventListener('resize', checkDevice);
    
    // Add orientation change listener
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};

export default useMobileDetect;