// Animation controller - loads original fireworks but enhances the first one

// Global variable to track if animation has started
let animationStarted = false;

// When the document is loaded, set up the animation sequence
document.addEventListener('DOMContentLoaded', function() {
  // Add not-loaded class to body to prevent animations from starting
  document.body.classList.add('not-loaded');
  
  // Hide the flowers completely
  const flowers = document.querySelector('.flowers');
  if (flowers) {
    // Don't use display:none as it may interfere with animation initialization
    // Just make it invisible
    flowers.style.opacity = '0';
    flowers.style.visibility = 'hidden';
  }
  
  // Hide the bubbles initially
  const bubbles = document.querySelector('.bubbles');
  if (bubbles) {
    bubbles.style.display = 'none';
  }
  
  // Create the canvas for fireworks
  setupFireworksCanvas();
  
  // Add the notification text
  addNotificationText();
  
  // Add handwriting CSS
  addHandwritingCSS();
  
  // Initialize handwriting animation
  if (typeof initHandwritingAnimation === 'function') {
    console.log('Initializing handwriting animation...');
    initHandwritingAnimation();
  } else {
    console.log('Handwriting animation function not found, creating fallback...');
    // Create a fallback function in case the external JS isn't loaded properly
    createHandwritingFallback();
  }
});

// Create a fallback for handwriting animation
function createHandwritingFallback() {
  // Add neon effect helper functions
  window.randomIn = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  window.mixupInterval = function(el) {
    const ms = window.randomIn(2000, 4000);
    el.style.setProperty('--interval', `${ms}ms`);
  };
  
  window.setupNeonFlicker = function(textElement) {
    // Initial random interval
    window.mixupInterval(textElement);
    
    // Setup event listener for animation iteration
    textElement.addEventListener('animationiteration', () => {
      window.mixupInterval(textElement);
    });
    
    // Also support webkit
    textElement.addEventListener('webkitAnimationIteration', () => {
      window.mixupInterval(textElement);
    });
  };
  
  window.initHandwritingAnimation = function() {
    // Create container for the handwriting animation if it doesn't exist
    let handwritingContainer = document.querySelector('.handwriting-container');
    
    if (!handwritingContainer) {
      handwritingContainer = document.createElement('div');
      handwritingContainer.className = 'handwriting-container';
      
      const textContainer = document.createElement('div');
      textContainer.className = 'text-container';
      
      const textAnimation = document.createElement('div');
      textAnimation.className = 'text-animation';
      textAnimation.id = 'text-animation';
      textAnimation.textContent = 'for Allena, just because.'; 
      
      // Set random interval for the flicker effect
      window.mixupInterval(textAnimation);
      
      textContainer.appendChild(textAnimation);
      handwritingContainer.appendChild(textContainer);
      document.body.appendChild(handwritingContainer);
      console.log('Handwriting container created');
    }
  };
  
  window.startHandwritingAnimation = function() {
    console.log('Starting handwriting animation fallback...');
    // Get the container
    const handwritingContainer = document.querySelector('.handwriting-container');
    if (!handwritingContainer) {
      console.log('Handwriting container not found, creating it now...');
      window.initHandwritingAnimation();
      setTimeout(window.startHandwritingAnimation, 100);
      return;
    }
    
    // Make it visible
    handwritingContainer.style.display = 'block';
    
    // Get the text element
    const textElement = document.getElementById('text-animation');
    if (!textElement) {
      console.log('Text animation element not found');
      return;
    }
    
    // Store the original text and clear it
    const text = textElement.textContent;
    textElement.textContent = '';
    
    // Create a sequence of spans with each letter
    const letters = text.split('');
    
    // Find the index of "with" to add a delay
    const withIndex = text.indexOf('with');
    
    // Reapply the text as individual spans with staggered animations
    letters.forEach((letter, index) => {
      const span = document.createElement('span');
      
      // Handle spaces differently
      if (letter === ' ') {
        span.innerHTML = '&nbsp;';
        span.classList.add('space');
      } else {
        span.textContent = letter;
      }
      
      // Slow down the animation (from 0.1s to 0.15s per letter)
      // Add a 1s pause before "with care."
      let delay = 0.15 + index * 0.15;
      
      // If we're at or after the "with" index, add the pause
      if (index >= withIndex && withIndex !== -1) {
        delay += 1.0;
      }
      
      span.style.animationDelay = `${delay}s`;
      textElement.appendChild(span);
    });
    
    // Exact implementation from the example to randomize flicker timing
    window.setupNeonFlicker(textElement);
  };
  
  // Initialize it immediately
  window.initHandwritingAnimation();
}

// Create the fireworks canvas
function setupFireworksCanvas() {
  // Create canvas element
  const fireworksCanvas = document.createElement('canvas');
  fireworksCanvas.id = 'fireworksCanvas';
  fireworksCanvas.style.position = 'absolute';
  fireworksCanvas.style.top = '0';
  fireworksCanvas.style.left = '0';
  fireworksCanvas.style.width = '100%';
  fireworksCanvas.style.height = '100%';
  fireworksCanvas.style.zIndex = '1000';
  fireworksCanvas.style.pointerEvents = 'auto';
  document.body.appendChild(fireworksCanvas);
  
  // Add the fireworks script
  const script = document.createElement('script');
  script.src = './heart-fireworks.js';
  
  // Once the script is loaded, override the necessary parts
  script.onload = function() {
    console.log('Fireworks script loaded');
    
    // Keep the original firework creation method for beautiful particles
    if (window.Firework && window.Particle) {
      // Create a special version of createFirework that ensures 
      // the first one is pink and properly positioned
      window.specialCreateFirstFirework = function() {
        // Check if fireworks array exists
        if (!window.fireworks) window.fireworks = [];
        
        // Create a new firework
        const firework = new window.Firework();
        
        // Override with our custom settings for the perfect first firework
        
        // 1. Guarantee pink colors
        firework.color = "rgb(255, 105, 180)";      // Hot pink
        firework.secondaryColor = "rgb(255, 20, 147)";  // Deep pink
        
        // 2. Position in center
        firework.x = window.innerWidth / 2;
        
        // 3. Ensure it launches to a higher point (5% from top instead of 10%)
        firework.targetY = window.innerHeight * 0.05; // Even higher (5% from top)
        
        // 4. Set even slower speed
        firework.speed = 2.5; // Much slower (previous value was 3.5)
        
        // 5. Make it go straight up
        const angle = -Math.PI / 2; // Straight up
        firework.vx = Math.cos(angle) * firework.speed;
        firework.vy = Math.sin(angle) * firework.speed;
        
        // Add to the fireworks array
        window.fireworks.push(firework);
        
        // Prevent auto-launch of more fireworks
        window.autoLaunch = false;
        
        return firework;
      };
    }
    
    // Listen for clicks on the entire document to start the animation sequence
    document.addEventListener('click', startAnimationSequence);
  };
  
  document.body.appendChild(script);
}

// Add the notification text to the center of the screen
function addNotificationText() {
  // Create a div element for the notification
  const notification = document.createElement('div');
  notification.id = 'startNotification';
  notification.textContent = 'Click anywhere to begin the magic!';
  
  // Style the notification
  notification.style.position = 'fixed';
  notification.style.top = '50%';
  notification.style.left = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.color = 'white';
  notification.style.fontSize = '18px';
  notification.style.fontFamily = 'Arial, sans-serif';
  notification.style.textAlign = 'center';
  notification.style.zIndex = '2000';
  notification.style.padding = '10px';
  notification.style.textShadow = '0 0 5px #fff, 0 0 10px #e60073';
  notification.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
  
  // Add breathing glow animation
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes breathingGlow {
      0% { text-shadow: 0 0 5px #fff, 0 0 10px #e60073; }
      50% { text-shadow: 0 0 7px #fff, 0 0 15px #e60073, 0 0 25px #e60073; }
      100% { text-shadow: 0 0 5px #fff, 0 0 10px #e60073; }
    }
    #startNotification {
      animation: breathingGlow 2s infinite ease-in-out;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Add it to the document
  document.body.appendChild(notification);
}

// Add handwriting CSS if not already included
function addHandwritingCSS() {
  // Check if handwriting CSS is already loaded
  let handwritingCSSLoaded = false;
  const styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    if (styleSheets[i].href && styleSheets[i].href.includes('handwriting-animation.css')) {
      handwritingCSSLoaded = true;
      break;
    }
  }
  
  // If not loaded, add it
  if (!handwritingCSSLoaded) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './handwriting-animation.css';
    document.head.appendChild(link);
    console.log('Handwriting CSS loaded');
    
    // Also add the script if not already added
    const scripts = document.getElementsByTagName('script');
    let handwritingScriptLoaded = false;
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.includes('handwriting-animation.js')) {
        handwritingScriptLoaded = true;
        break;
      }
    }
    
    if (!handwritingScriptLoaded) {
      const script = document.createElement('script');
      script.src = './handwriting-animation.js';
      document.body.appendChild(script);
      console.log('Handwriting JS loaded');
    }
  }
}

// Start the animation sequence
function startAnimationSequence(event) {
  // Only run this once
  if (animationStarted) return;
  animationStarted = true;
  
  // Remove the click event listener so it doesn't fire again
  document.removeEventListener('click', startAnimationSequence);
  
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
    console.log('Creating special first pink firework');
    window.specialCreateFirstFirework();
  } else if (typeof window.createFirework === 'function') {
    // Fallback to regular firework if our special one isn't available
    console.log('Falling back to regular firework');
    window.createFirework();
  }
  
  // Wait 2 seconds (enough time for the firework to complete)
  setTimeout(function() {
    console.log('Starting flower bloom...');
    
    // Show the flowers and trigger animation
    const flowers = document.querySelector('.flowers');
    if (flowers) {
      // Make flowers visible
      flowers.style.visibility = 'visible';
      flowers.style.opacity = '1';
      flowers.style.transition = 'opacity 0.5s ease';
      
      // Remove the not-loaded class to trigger animations
      document.body.classList.remove('not-loaded');
      
      console.log('Flower bloom animation triggered');
    }
    
    // Wait 4 more seconds for flowers to bloom before showing heart bubbles
    setTimeout(function() {
      console.log('Showing heart bubbles...');
      
      // Show the heart bubbles
      const bubbles = document.querySelector('.bubbles');
      if (bubbles) {
        bubbles.style.display = '';
        console.log('Heart bubbles shown');
      }
      
      // Start handwriting animation at the same time as heart bubbles
      if (typeof startHandwritingAnimation === 'function') {
        console.log('Starting handwriting animation with heart bubbles...');
        startHandwritingAnimation();
      }
    }, 4000);
  }, 2000);
}
