// Fireworks and blooming flowers controller

// Global variables
let flowersCanBloom = false;
let fireworksLoaded = false;
let clickHandled = false;

// Setup fireworks canvas and prepare the page
function setupFireworks() {
  // COMPLETELY HIDE THE FLOWERS ELEMENT initially
  const flowers = document.querySelector('.flowers');
  if (flowers) {
    flowers.style.visibility = 'hidden';
    flowers.style.opacity = '0';
  }

  // Make sure the body doesn't have not-loaded class
  document.body.classList.remove('not-loaded');

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
  fireworksCanvas.style.backgroundColor = 'transparent';
  document.body.appendChild(fireworksCanvas);

  // Load the fireworks script
  loadFireworksScript();

  // Hide the bubbles initially
  const bubbles = document.querySelector('.bubbles');
  if (bubbles) {
    bubbles.style.display = 'none';
  }

  // Listen for clicks on the canvas
  fireworksCanvas.addEventListener('click', handleFirstClick);
  
  // Also listen for clicks on the document for better responsiveness
  document.addEventListener('click', function globalClickHandler(e) {
    if (!clickHandled) {
      handleFirstClick(e);
      // Only handle the first click
      document.removeEventListener('click', globalClickHandler);
    }
  });
}

// Load fireworks script
function loadFireworksScript() {
  // Create a new script tag
  const script = document.createElement('script');
  script.src = '../Project/celebration-2025 - Copy (6) - Copy/dist/heart-fireworks.js';
  
  // Set onload handler
  script.onload = function() {
    console.log('Fireworks script loaded successfully');
    
    // Reset the flag for first firework when the script loads
    if (window.isFirstFireworkAfterLoad !== undefined) {
      window.isFirstFireworkAfterLoad = true;
    }
    
    fireworksLoaded = true;
    
    // Make sure autoLaunch is disabled
    if (typeof window.autoLaunch !== 'undefined') {
      window.autoLaunch = false;
    }
  };
  
  // Set error handler
  script.onerror = function() {
    console.error('Failed to load fireworks script');
    // If script fails to load, we'll just start the flower blooming
    fireworksLoaded = false;
    startFlowerBlooming();
  };
  
  // Add script to document
  document.body.appendChild(script);
}

// Handle first click
function handleFirstClick(event) {
  if (clickHandled) return;
  clickHandled = true;
  
  if (fireworksLoaded && typeof window.createFirework === 'function') {
    // If we have fireworks functionality, create a firework
    try {
      window.createFirework();
    } catch (error) {
      console.error('Error creating firework:', error);
    }
    
    // Start checking for when the firework COMPLETES
    waitForFireworkCompletion();
  } else {
    // If fireworks didn't load properly, just start the flowers
    startFlowerBlooming();
  }
}

// Wait for the entire firework animation to complete
function waitForFireworkCompletion() {
  let checkAttempts = 0;
  const maxAttempts = 200; // 20 seconds max wait (200 * 100ms)
  let explosionDetected = false;
  let fireworkStartTime = Date.now();
  
  // Check every 100ms for firework status
  const checkInterval = setInterval(() => {
    checkAttempts++;
    
    // FORCE a minimum wait time before flowers can bloom (3 seconds)
    const elapsedTime = Date.now() - fireworkStartTime;
    if (elapsedTime < 3000) {
      return; // Exit early if not enough time has passed
    }
    
    // If no fireworks found or error, stop checking and start flowers
    if (!window.fireworks || window.fireworks.length === 0) {
      if (checkAttempts > 30) { // Give it some time to initialize
        clearInterval(checkInterval);
        console.log('No fireworks found, starting flowers');
        startFlowerBlooming();
      }
      return;
    }
    
    // First detect if the firework has exploded (has particles)
    if (!explosionDetected) {
      explosionDetected = window.fireworks.some(fw => fw.exploded && fw.particles.length > 0);
      
      // If we just detected the explosion, log it but don't start flowers yet
      if (explosionDetected) {
        console.log('Firework explosion detected, waiting for completion');
      }
    }
    
    // Only after explosion is detected, check if animation is complete
    if (explosionDetected) {
      // Check if the firework is complete (done property is true or progress is nearly 1)
      const isComplete = window.fireworks.every(fw => 
        fw.done === true || fw.progress >= 0.95 || 
        (fw.exploded && fw.particles.every(p => p.opacity <= 0.1))
      );
      
      if (isComplete) {
        clearInterval(checkInterval);
        console.log('Firework animation complete, starting flowers');
        
        // Wait a moment after the last particles fade out before starting flowers
        setTimeout(() => {
          startFlowerBlooming();
        }, 1000); // Longer delay to ensure all particles are gone
      }
    }
    
    // Safety timeout - if we've waited too long, just start the flowers
    if (checkAttempts >= maxAttempts) {
      clearInterval(checkInterval);
      console.log('Timeout waiting for firework completion, starting flowers');
      startFlowerBlooming();
    }
  }, 100);
}

// Start the flower blooming animation
function startFlowerBlooming() {
  // Show the flowers element and remove not-loaded class
  const flowers = document.querySelector('.flowers');
  if (flowers) {
    // Make flowers visible with a fade-in effect
    flowers.style.visibility = 'visible';
    flowers.style.transition = 'opacity 0.5s ease';
    flowers.style.opacity = '1';
    
    // Remove not-loaded class to start animations
    flowers.classList.remove('not-loaded');
  }
  
  // Show hearts after flower has fully bloomed (approx. 4 seconds after animation starts)
  setTimeout(() => {
    const bubbles = document.querySelector('.bubbles');
    if (bubbles) {
      bubbles.style.display = '';
    }
  }, 4000);
}

// Initialize everything when the page loads
window.onload = () => {
  // Add a small delay before setup to make sure everything is loaded
  setTimeout(setupFireworks, 500);
};
