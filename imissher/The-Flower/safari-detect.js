// Safari detection and compatibility script
document.addEventListener('DOMContentLoaded', function() {
  // Safari detection
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  if (isSafari) {
    // Add safari class to html element
    document.documentElement.classList.add('safari');
    
    // Dynamically load Safari-specific CSS
    var linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = './safari-fixes.css';
    document.head.appendChild(linkElement);
    
    // Also load handwriting specific Safari fixes
    var handwritingFixesLink = document.createElement('link');
    handwritingFixesLink.rel = 'stylesheet';
    handwritingFixesLink.href = './handwriting-safari-fixes.css';
    document.head.appendChild(handwritingFixesLink);
    
    // Load Safari-specific flower animation fixes
    var flowerFixesLink = document.createElement('link');
    flowerFixesLink.rel = 'stylesheet';
    flowerFixesLink.href = './flower-safari-fixes.css';
    document.head.appendChild(flowerFixesLink);
    
    console.log('Safari detected, loaded compatibility styles');
    
    // Add requestAnimationFrame polyfill if needed
    if (!window.requestAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function(callback) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { 
          callback(currTime + timeToCall); 
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
    
    // Fix for WebFont loading in Safari
    if (typeof WebFont !== 'undefined') {
      WebFont.load({
        custom: {
          families: ['Autography'],
          urls: ['./handwriting-animation.css']
        },
        timeout: 5000 // Increase timeout for Safari
      });
    }
    
    // Add meta tags for Safari
    var metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.name = 'viewport';
      metaViewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(metaViewport);
    }
    
    // Add a special class to handwriting container when it exists
    var checkHandwritingContainer = setInterval(function() {
      var handwritingContainer = document.querySelector('.handwriting-container');
      if (handwritingContainer) {
        handwritingContainer.classList.add('safari-optimized');
        clearInterval(checkHandwritingContainer);
      }
    }, 100);
    
    // Load Safari-specific animation controller script (for timing fixes)
    // This needs to load AFTER the main animation-controller.js
    // We'll add a short delay to ensure proper loading order
    setTimeout(function() {
      var safariAnimationScript = document.createElement('script');
      safariAnimationScript.src = './safari-animation-controller.js';
      document.body.appendChild(safariAnimationScript);
      console.log('Safari animation timing adjustments script loaded');
    }, 500);
  }
});
