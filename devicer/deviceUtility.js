const DeviceHelper = {
    getDeviceType: () => {
      // 1. Check for specific desktop features
      if (window.matchMedia('(min-width: 1200px)').matches && 
          !navigator.maxTouchPoints) {
        return 'desktop';
      }
      
      // 2. Check for tablet (could use mobile or desktop approach)
      if (window.matchMedia('(min-width: 768px)').matches && 
          navigator.maxTouchPoints) {
        return 'tablet'; // Could treat as mobile or desktop
      }
      
      // 3. Check for specific mobile features
      if (navigator.connection) {
        const conn = navigator.connection;
        if (conn.saveData || conn.effectiveType.includes('2g')) {
          return 'mobile';
        }
      }
      
      // 4. Default based on combination of factors
      const points = {
        mobile: 0,
        desktop: 0
      };
      
      // Touch support
      if ('ontouchstart' in window) points.mobile++;
      else points.desktop++;
      
      // Screen size
      if (window.innerWidth < 768) points.mobile++;
      else points.desktop++;
      
      // User agent
      if (/mobile|android|iphone/i.test(navigator.userAgent)) points.mobile++;
      else points.desktop++;
      
      return points.mobile > points.desktop ? 'mobile' : 'desktop';
    }
  };