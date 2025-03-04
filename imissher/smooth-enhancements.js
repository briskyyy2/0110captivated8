/**
 * Smooth Enhancements
 * Integrated performance optimizations and visual enhancements
 */
(function() {
  // Configuration
  const config = {
    audio: {
      enabled: true,
      volume: 0.5
    },
    animations: {
      enabled: true,
      mouseTrail: true,
      smoothScroll: true
    },
    performance: {
      useHardwareAcceleration: true,
      limitParticles: false
    }
  };
  
  // Audio system
  const audioSystem = {
    context: null,
    masterGain: null,
    sounds: {},
    
    init: function() {
      if (!config.audio.enabled) return;
      
      try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.context = new AudioContext();
          
          // Create master gain node
          this.masterGain = this.context.createGain();
          this.masterGain.gain.value = config.audio.volume;
          this.masterGain.connect(this.context.destination);
          
          // Resume audio context on user interaction
          document.addEventListener('click', () => {
            if (this.context && this.context.state === 'suspended') {
              this.context.resume();
            }
          }, { once: true });
          
          // Load default sounds
          this.loadSound('typewriter', 'https://assets.codepen.io/385863/key-press.mp3');
          this.loadSound('click', 'https://assets.codepen.io/217233/click.mp3');
          this.loadSound('hover', 'https://assets.codepen.io/217233/hover.mp3');
          this.loadSound('magic', 'https://assets.codepen.io/217233/magic.mp3');
        }
      } catch (e) {
        console.log('Audio initialization failed:', e);
      }
    },
    
    loadSound: function(id, url) {
      if (!this.context) return Promise.resolve();
      
      return fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          this.sounds[id] = { buffer: audioBuffer };
          return audioBuffer;
        })
        .catch(error => {
          console.warn(`Failed to load sound ${id}:`, error);
        });
    },
    
    play: function(id) {
      if (!this.context || !this.sounds[id]) return;
      
      const source = this.context.createBufferSource();
      source.buffer = this.sounds[id].buffer;
      
      const gainNode = this.context.createGain();
      gainNode.gain.value = config.audio.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      source.start(0);
    }
  };
  
  // Smooth scroll with subtle parallax
  const smoothScroll = {
    init: function() {
      if (!config.animations.smoothScroll) return;
      
      // Get all elements with data-parallax attribute
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      
      // Update parallax positions on scroll
      window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          
          parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const yPos = -(scrollTop * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
          });
        });
      });
      
      // Apply smooth scroll to all anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (!targetElement) return;
          
          // Play click sound
          audioSystem.play('click');
          
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          
          let startTime = null;
          const duration = 1000;
          
          function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function (easeInOutQuad)
            const easing = progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              
            window.scrollTo(0, startPosition + distance * easing);
            
            if (timeElapsed < duration) {
              requestAnimationFrame(animation);
            }
          }
          
          requestAnimationFrame(animation);
        });
      });
    }
  };
  
  // Mouse trail effect
  const mouseTrail = {
    particles: [],
    container: null,
    mouseX: 0,
    mouseY: 0,
    lastEmitTime: 0,
    
    init: function() {
      if (!config.animations.mouseTrail) return;
      
      // Create container for particles
      this.container = document.createElement('div');
      this.container.style.position = 'fixed';
      this.container.style.top = '0';
      this.container.style.left = '0';
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.style.pointerEvents = 'none';
      this.container.style.zIndex = '9999';
      document.body.appendChild(this.container);
      
      // Track mouse position
      window.addEventListener('mousemove', e => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        const now = Date.now();
        if (now - this.lastEmitTime > 50) { // Limit particle creation rate
          this.emitParticle();
          this.lastEmitTime = now;
        }
      });
      
      // Animation loop
      this.animate();
    },
    
    emitParticle: function() {
      // Create particle element
      const particle = document.createElement('div');
      
      // Randomly choose between circle and star
      const isCircle = Math.random() > 0.3;
      const size = Math.random() * 6 + 4;
      
      particle.style.position = 'absolute';
      particle.style.left = `${this.mouseX}px`;
      particle.style.top = `${this.mouseY}px`;
      
      if (isCircle) {
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.background = 'rgba(255, 182, 193, 0.7)';
        particle.style.boxShadow = '0 0 5px rgba(255, 105, 180, 0.5)';
      } else {
        particle.textContent = '✨';
        particle.style.fontSize = `${size * 1.5}px`;
        particle.style.color = 'rgba(255, 223, 223, 0.9)';
      }
      
      particle.style.transform = 'translate(-50%, -50%)';
      this.container.appendChild(particle);
      
      // Random movement
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 1; // Slight upward bias
      
      // Store particle data
      const particleData = {
        element: particle,
        x: this.mouseX,
        y: this.mouseY,
        vx: vx,
        vy: vy,
        life: 0,
        maxLife: Math.random() * 500 + 500
      };
      
      this.particles.push(particleData);
    },
    
    animate: function() {
      // Update all particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life++;
        
        // Remove dead particles
        if (p.life >= p.maxLife) {
          p.element.remove();
          this.particles.splice(i, 1);
          continue;
        }
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Update opacity based on life
        const opacity = 1 - (p.life / p.maxLife);
        
        // Apply updates
        p.element.style.left = `${p.x}px`;
        p.element.style.top = `${p.y}px`;
        p.element.style.opacity = opacity.toString();
      }
      
      requestAnimationFrame(() => this.animate());
    }
  };
  
  // Performance optimizations
  const performanceOptimizer = {
    init: function() {
      if (config.performance.useHardwareAcceleration) {
        // Apply hardware acceleration to key elements
        const elementsToOptimize = [
          '#typewriter-container',
          '.button',
          'label[for="toggle-heart"]',
          '.button--bubble__container'
        ];
        
        elementsToOptimize.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.transform = 'translateZ(0)';
            el.style.backfaceVisibility = 'hidden';
            el.style.willChange = 'transform, opacity';
          });
        });
      }
      
      // Add click/hover sounds to interactive elements
      document.addEventListener('click', e => {
        if (e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'A' || 
            e.target.closest('button') || 
            e.target.closest('a') ||
            e.target.closest('[role="button"]')) {
          audioSystem.play('click');
        }
      });
      
      // Add hover sound with debouncing
      let hoverTimeout;
      document.addEventListener('mouseover', e => {
        if (e.target.tagName === 'BUTTON' || 
            e.target.tagName === 'A' || 
            e.target.closest('button') || 
            e.target.closest('a') ||
            e.target.closest('[role="button"]')) {
          
          clearTimeout(hoverTimeout);
          hoverTimeout = setTimeout(() => {
            audioSystem.play('hover');
          }, 50);
        }
      });
    }
  };
  
  // Add subtle visual enhancements
  const visualEnhancer = {
    init: function() {
      // Add subtle grain texture for depth
      const grain = document.createElement('div');
      grain.classList.add('grain');
      grain.style.position = 'fixed';
      grain.style.top = '0';
      grain.style.left = '0';
      grain.style.width = '100%';
      grain.style.height = '100%';
      grain.style.pointerEvents = 'none';
      grain.style.zIndex = '0';
      grain.style.opacity = '0.05';
      grain.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")';
      document.body.appendChild(grain);
      
      // Add CSS styles for enhanced animations
      const style = document.createElement('style');
      style.textContent = `
        .highlight {
          background-image: linear-gradient(
            to right,
            rgba(255, 127, 178, 0) 0%,
            rgba(255, 127, 178, 0.5) 5%,
            rgba(255, 127, 178, 0.5) 95%,
            rgba(255, 127, 178, 0) 100%
          );
          background-position: 0 88%;
          background-size: 100% 0.8em;
          background-repeat: no-repeat;
          color: #ff6eb4;
          font-weight: bold;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0% { background-size: 100% 0.8em; }
          50% { background-size: 100% 1em; }
          100% { background-size: 100% 0.8em; }
        }
        
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        button, .button {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                    box-shadow 0.2s ease, 
                    background-color 0.2s ease;
        }
        
        button:hover, .button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
        }
        
        button:active, .button:active {
          transform: translateY(1px) scale(0.98);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `;
      document.head.appendChild(style);
      
      // Enhance typewriter effect when available
      const typewriterContainer = document.getElementById('typewriter-container');
      if (typewriterContainer) {
        typewriterContainer.classList.add('fade-in');
        setTimeout(() => {
          typewriterContainer.classList.add('visible');
        }, 500);
      }
      
      // Add magical effect to heart
      const heartLabel = document.querySelector('label[for="toggle-heart"]');
      if (heartLabel) {
        heartLabel.addEventListener('mouseenter', () => {
          audioSystem.play('magic');
          
          // Add temporary glow effect
          heartLabel.style.textShadow = '0 0 15px rgba(255, 105, 180, 0.8)';
          setTimeout(() => {
            heartLabel.style.textShadow = '';
          }, 500);
        });
      }
    }
  };
  
  // Initialize all systems
  document.addEventListener('DOMContentLoaded', function() {
    audioSystem.init();
    smoothScroll.init();
    performanceOptimizer.init();
    visualEnhancer.init();
    
    // Initialize mouse trail last (least critical)
    setTimeout(() => {
      mouseTrail.init();
    }, 1000);
    
    console.log('Smooth enhancements initialized');
  });
})();
