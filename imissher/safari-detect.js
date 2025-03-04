/**
 * Safari Detection Script
 * Automatically detects Safari browser and loads Safari-specific CSS files
 */

(function() {
  function isSafari() {
    // Detect Safari browser
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1;
  }

  function loadCssFile(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    document.head.appendChild(link);
    console.log('Loaded Safari compatibility CSS: ' + path);
  }
  
  function loadJsFile(path) {
    const script = document.createElement('script');
    script.src = path;
    document.body.appendChild(script);
    console.log('Loaded Safari compatibility JS: ' + path);
  }

  // Check if the browser is Safari
  if (isSafari()) {
    console.log('Safari detected, loading compatibility files');
    
    // Add a class to the body for any Safari-specific CSS selectors
    // Do this immediately so it's available when page loads
    document.addEventListener('DOMContentLoaded', function() {
      document.body.classList.add('safari-browser');
      document.documentElement.classList.add('safari');
    });
    
    // Load general Safari compatibility CSS
    loadCssFile('safari-compatibility.css');
    
    // Load new type fixes CSS
    loadCssFile('safari-type-fixes.css');
    
    // Load component-specific Safari compatibility fixes
    loadCssFile('button-safari-fixes.css');
    
    // Flower-specific fixes
    if (window.location.href.includes('The-Flower')) {
      console.log('Loading Safari-specific flower and heart fixes');
      loadCssFile('flower-safari-fixes.css');
      loadCssFile('heart-safari-fixes.css');
      
      // Load the safari-specific animation controller for the flower page
      setTimeout(function() {
        loadJsFile('safari-animation-controller.js');
      }, 200);
    }
    
    // Load requestAnimationFrame polyfill for older Safari versions
    loadJsFile('raf-polyfill.js');
    
    // Add Safari-specific button animation script (loaded at end of body)
    document.addEventListener('DOMContentLoaded', function() {
      // Wait for main button.js to load first, then override with Safari-specific version
      setTimeout(function() {
        loadJsFile('button-safari.js');
      }, 500);
    });
  }
})();
