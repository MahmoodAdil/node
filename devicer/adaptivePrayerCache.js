class AdaptivePrayerCache {
    constructor() {
      this.deviceType = DeviceHelper.getDeviceType();
      this.cacheSystem = this._initCacheSystem();
    }
  
    _initCacheSystem() {
      switch (this.deviceType) {
        case 'mobile':
          return {
            type: 'mobile',
            instance: new MobilePrayerCache(),
            strategy: {
              preload: true,
              chunkSize: 30, // days
              fallback: 'localStorage'
            }
          };
          
        case 'tablet':
          return {
            type: 'tablet',
            instance: new MobilePrayerCache(), // or desktop based on memory
            strategy: {
              preload: true,
              chunkSize: 60,
              fallback: 'indexedDB'
            }
          };
          
        default: // desktop
          return {
            type: 'desktop',
            instance: new DesktopPrayerCache(),
            strategy: {
              preload: false,
              fullLoad: true,
              fallback: 'indexedDB'
            }
          };
      }
    }
  
    async getPrayerTimes(date = new Date()) {
      // Add device-specific optimizations
      if (this.deviceType === 'mobile') {
        // For mobile, check memory cache first
        const memoryCache = this.cacheSystem.instance.memoryCache;
        const dateKey = date.toISOString().split('T')[0];
        if (memoryCache.has(dateKey)) {
          return memoryCache.get(dateKey);
        }
      }
      
      return this.cacheSystem.instance.getDailyTimes(date);
    }
  
    async preloadData() {
      if (this.cacheSystem.strategy.preload) {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        
        await this.cacheSystem.instance._loadMonthData(
          today.getFullYear(), 
          today.getMonth() + 1
        );
        
        if (this.deviceType === 'tablet') {
          await this.cacheSystem.instance._loadMonthData(
            nextMonth.getFullYear(),
            nextMonth.getMonth() + 1
          );
        }
      }
    }
  }