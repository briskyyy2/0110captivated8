/**
 * Safari-specific animation controller adjustments
 * This script is only loaded when Safari is detected
 * and provides timing adjustments for Safari browsers
 */
(function() {
  // Only run this code in Safari
  if (!document.documentElement.classList.contains('safari')) {
    return;
  }

  console.log('Safari animation timing adjustments loaded');

  // Override the startAnimationSequence function to add Safari-specific timing
  const originalStartAnimationSequence = window.startAnimationSequence;

  // Replace the original function with our modified version with Safari-specific timings
  window.startAnimationSequence = function(event) {
    // Only run this once
    if (window.animationStarted) return;
    window.animationStarted = true;
    
    // Remove the click event listener so it doesn't fire again
    document.removeEventListener('click', window.startAnimationSequence);
    
    // Remove the notification text
    const notification = document.getElementById('startNotification');
    if (notification) {
      // Add a fade out effect
      notification.style.transition = 'opacity 0.5s ease';
      notification.style.opacity = '0';
      
      // Remove it from the DOM after the animation completes
      setTimeout(function() {
        notification.remove();
      }, 500);
    }
    
    // Launch our perfectly crafted pink firework
    if (typeof window.specialCreateFirstFirework === 'function') {
      console.log('Creating special first pink firework (Safari adjusted)');
      window.specialCreateFirstFirework();
    } else if (typeof window.createFirework === 'function') {
      // Fallback to regular firework if our special one isn't available
      console.log('Falling back to regular firework (Safari adjusted)');
      window.createFirework();
    }
    
    // SAFARI FIX: Wait 4.5 seconds instead of 2 seconds for the firework to complete
    // This ensures the flower doesn't start blooming before the firework is done
    setTimeout(function() {
      console.log('Starting flower bloom (Safari timing)...');
      
      // Show the flowers and trigger animation
      const flowers = document.querySelector('.flowers');
      if (flowers) {
        // Apply hardware acceleration for smoother transitions in Safari
        flowers.style.webkitTransform = 'translateZ(0)';
        flowers.style.transform = 'translateZ(0)';
        
        // Make flowers visible
        flowers.style.visibility = 'visible';
        flowers.style.opacity = '1';
        flowers.style.transition = 'opacity 0.5s ease';
        
        // Delay removing the not-loaded class to ensure firework completes
        setTimeout(function() {
          // Remove the not-loaded class to trigger animations
          document.body.classList.remove('not-loaded');
          console.log('Flower bloom animation triggered (Safari adjusted)');
        }, 500);
      }
      
      // SAFARI FIX: Wait 5.5 seconds instead of 4 seconds for flowers to bloom
      setTimeout(function() {
        console.log('Showing heart bubbles (Safari timing)...');
        
        // Show the heart bubbles
        const bubbles = document.querySelector('.bubbles');
        if (bubbles) {
          // Apply hardware acceleration for Safari
          bubbles.style.webkitTransform = 'translateZ(0)';
          bubbles.style.transform = 'translateZ(0)';
          bubbles.style.display = '';
          console.log('Heart bubbles shown (Safari adjusted)');
        }
        
        // Start handwriting animation at the same time as heart bubbles
        if (typeof window.startHandwritingAnimation === 'function') {
          console.log('Starting handwriting animation with heart bubbles (Safari adjusted)...');
          window.startHandwritingAnimation();
        }
      }, 5500); // 5.5 seconds instead of 4
    }, 4500); // 4.5 seconds instead of 2
  };

  console.log('Safari animation timing adjustments applied');
})();
