/**
 * Performance Configuration
 * Central control for animation and performance settings
 */
const PERFORMANCE_CONFIG = {
  // Core Animation Settings
  animations: {
    useRequestAnimationFrame: true,
    useGPUAcceleration: true,
    useIntersectionObserver: true,
    preferReducedMotion: false, // Respects user preference when true
    throttleFPS: 60, // Target FPS cap for animations
    preloadAssets: true
  },
  
  // Timing Settings (in milliseconds)
  timing: {
    typewriterBaseSpeed: 40,
    typewriterFastSpeed: 15,
    heartAnimation: 1200,
    fadeDuration: 500,
    transitionDuration: 800,
    fireworkTimeout: 4500, // For Safari compatibility
    flowerBloomDelay: 5000,
    heartBubblesDelay: 5500
  },
  
  // Visual Enhancement Settings
  visual: {
    useBloom: true,        // Bloom effect on particles and hearts
    useParallax: true,     // Subtle parallax effects
    particleDensity: 1.0,  // Multiplier for particle count (0.5 = half, 2.0 = double)
    colorIntensity: 1.2,   // Color saturation boost
    useCustomCursor: true  // Enable custom cursor
  },
  
  // Browser Detection and Compatibility
  browser: {
    enableSafariOptimizations: true,
    enableFirefoxOptimizations: true, 
    enableEdgeOptimizations: true,
    enableMobileOptimizations: true,
    useFeatureDetection: true,  // Use feature detection instead of UA sniffing when possible
    fallbackToBasicAnimations: false // Default to false, will be set true for very old browsers
  },
  
  // Debug Options
  debug: {
    showFPS: false,
    logPerformanceMetrics: false,
    showAnimationBoundaries: false
  }
};

// Browser Feature Detection
const BROWSER_FEATURES = {
  supportsWebGL: false,
  supportsWebP: false,
  supportsBackdropFilter: false,
  supportsTouchEvents: false,
  supportsIntersectionObserver: false,
  isHighEndDevice: false
};

// Detect browser features
(function detectFeatures() {
  // WebGL support
  try {
    const canvas = document.createElement('canvas');
    BROWSER_FEATURES.supportsWebGL = !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch(e) {
    BROWSER_FEATURES.supportsWebGL = false;
  }
  
  // Intersection Observer support
  BROWSER_FEATURES.supportsIntersectionObserver = 'IntersectionObserver' in window;
  
  // Touch support
  BROWSER_FEATURES.supportsTouchEvents = ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    (navigator.msMaxTouchPoints > 0);
    
  // Backdrop filter support
  BROWSER_FEATURES.supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
    
  // High-end device detection (very basic)
  BROWSER_FEATURES.isHighEndDevice = !!(
    navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 4 && 
    window.devicePixelRatio >= 2
  );
  
  // WebP support detection
  const webP = new Image();
  webP.onload = function() { BROWSER_FEATURES.supportsWebP = (webP.height === 1); };
  webP.onerror = function() { BROWSER_FEATURES.supportsWebP = false; };
  webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  
  // Adjust performance config based on device capabilities
  if (!BROWSER_FEATURES.isHighEndDevice) {
    PERFORMANCE_CONFIG.visual.particleDensity = 0.6;
    PERFORMANCE_CONFIG.visual.useBloom = false;
  }
})();

// Export configuration
window.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG;
window.BROWSER_FEATURES = BROWSER_FEATURES;
