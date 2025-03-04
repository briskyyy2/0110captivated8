// Safari-compatible requestAnimationFrame polyfill
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz', 'ms', 'o'];
  
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  
  if (!window.requestAnimationFrame) {
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
  
  // Force reflow helper
  window.forceReflow = function(element) {
    if (!element) return;
    void element.offsetWidth;
  };
  
  // Test for passive event support
  window.supportsPassive = false;
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function() {
        window.supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('test', null, opts);
  } catch (e) {}
  
  // For Safari touch event handling
  window.addSafariPassiveHandler = function(element, event, callback) {
    element.addEventListener(event, callback, window.supportsPassive ? { passive: true } : false);
  };
})();
