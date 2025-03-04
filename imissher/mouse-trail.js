/**
 * Magical Mouse Trail
 * Creates a subtle sparkle effect that follows the mouse cursor
 */
document.addEventListener('DOMContentLoaded', function() {
  // Skip if reduced motion is preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  // Check if disabled in performance config
  if (window.PERFORMANCE_CONFIG && window.PERFORMANCE_CONFIG.animations.mouseTrail === false) {
    return;
  }
  
  // Mouse trail configuration
  const config = {
    particleCount: 15,
    particleLifespan: 1000,
    particleSpeed: 1.2,
    trailDelay: 80,
    particleColors: ['#ffcad4', '#f4acb7', '#9d8189', '#d8e2dc', '#ffe5d9'],
    emojis: ['✨', '💖', '✨', '💕', '✨']
  };
  
  // Keep track of mouse position
  let mouseX = 0;
  let mouseY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let lastTrailTime = 0;
  
  // Update mouse position on move
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Create particle container
  const container = document.createElement('div');
  container.classList.add('mouse-trail-container');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);
  
  // Animation frame loop
  function animateParticles() {
    // Only create trails when mouse is moving
    const now = Date.now();
    const mouseHasMoved = Math.abs(mouseX - prevMouseX) > 3 || Math.abs(mouseY - prevMouseY) > 3;
    
    if (mouseHasMoved && now - lastTrailTime > config.trailDelay) {
      createTrailParticles();
      lastTrailTime = now;
    }
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    
    requestAnimationFrame(animateParticles);
  }
  
  // Create a group of particles at current mouse position
  function createTrailParticles() {
    const count = Math.floor(Math.random() * 2) + 1; // 1 or 2 particles at a time for subtlety
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createParticle(
          mouseX + Math.random() * 20 - 10,
          mouseY + Math.random() * 20 - 10
        );
      }, i * 10);
    }
  }
  
  // Create individual particle
  function createParticle(x, y) {
    const particle = document.createElement('div');
    
    // Randomly decide whether to use emoji or circle particle
    const useEmoji = Math.random() > 0.7;
    
    if (useEmoji) {
      // Emoji particle
      const randomEmoji = config.emojis[Math.floor(Math.random() * config.emojis.length)];
      particle.textContent = randomEmoji;
      particle.style.fontSize = `${Math.random() * 10 + 8}px`;
      particle.style.opacity = '0.8';
    } else {
      // Circle particle
      const size = Math.random() * 6 + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.borderRadius = '50%';
      particle.style.background = config.particleColors[Math.floor(Math.random() * config.particleColors.length)];
      particle.style.boxShadow = '0 0 6px rgba(255,182,193,0.5)';
    }
    
    // Common particle styles
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.transform = 'translate(-50%, -50%)';
    particle.style.pointerEvents = 'none';
    
    // Add to container
    container.appendChild(particle);
    
    // Animate the particle
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * config.particleSpeed;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - 1; // Slight upward bias
    
    let posX = x;
    let posY = y;
    let opacity = 1;
    let scale = 1;
    
    const startTime = Date.now();
    
    function updateParticle() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / config.particleLifespan;
      
      if (progress >= 1) {
        particle.remove();
        return;
      }
      
      // Update position
      posX += vx;
      posY += vy;
      
      // Update opacity and scale
      opacity = 1 - progress;
      scale = 1 - progress * 0.5;
      
      // Apply updates
      particle.style.left = `${posX}px`;
      particle.style.top = `${posY}px`;
      particle.style.opacity = opacity.toString();
      particle.style.transform = `translate(-50%, -50%) scale(${scale})`;
      
      requestAnimationFrame(updateParticle);
    }
    
    requestAnimationFrame(updateParticle);
  }
  
  // Start the animation loop
  animateParticles();
  
  // Special trigger for heart element
  const heartLabel = document.querySelector('label[for="toggle-heart"]');
  if (heartLabel) {
    heartLabel.addEventListener('mouseenter', function() {
      // Create a burst of particles
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const rect = heartLabel.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          createParticle(
            centerX + (Math.random() * rect.width - rect.width/2) * 1.5,
            centerY + (Math.random() * rect.height - rect.height/2) * 1.5
          );
        }, i * 50);
      }
    });
  }
});
