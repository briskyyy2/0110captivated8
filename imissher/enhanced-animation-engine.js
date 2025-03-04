/**
 * Enhanced Animation Engine
 * Provides optimized, hardware-accelerated animations with fallbacks
 */
class AnimationEngine {
  constructor(config = window.PERFORMANCE_CONFIG) {
    this.config = config;
    this.activeAnimations = new Map();
    this.frameId = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateInterval = 500; // Update FPS every 500ms
    this.lastFpsUpdate = 0;
    this.observers = new Map();
    this.initialized = false;
    
    // Bind methods
    this.update = this.update.bind(this);
    this.initializeEngine();
  }
  
  initializeEngine() {
    if (this.initialized) return;
    
    // Setup RAF polyfill for older browsers
    this.setupRAFPolyfill();
    
    // Setup FPS counter if debug is enabled
    if (this.config.debug.showFPS) {
      this.setupFPSCounter();
    }
    
    // Setup global listeners
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    
    // Check for reduced motion preference
    if (window.matchMedia && this.config.animations.preferReducedMotion) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        this.config.animations.useParallax = false;
        this.config.timing.typewriterBaseSpeed = 10;
        this.config.timing.fadeDuration = 200;
      }
      motionQuery.addEventListener('change', () => {
        this.config.animations.useParallax = !motionQuery.matches;
      });
    }
    
    this.initialized = true;
    console.log('Animation engine initialized with config:', this.config);
  }
  
  setupRAFPolyfill() {
    // Polyfill for requestAnimationFrame
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.msRequestAnimationFrame || 
        function(callback) { 
          return window.setTimeout(callback, 1000 / 60); 
        };
    }
    
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = 
        window.webkitCancelAnimationFrame || 
        window.mozCancelAnimationFrame || 
        window.msCancelAnimationFrame || 
        function(id) { 
          window.clearTimeout(id); 
        };
    }
  }
  
  setupFPSCounter() {
    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fps-counter';
    fpsCounter.style.position = 'fixed';
    fpsCounter.style.bottom = '10px';
    fpsCounter.style.right = '10px';
    fpsCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    fpsCounter.style.color = 'white';
    fpsCounter.style.padding = '5px 10px';
    fpsCounter.style.borderRadius = '3px';
    fpsCounter.style.fontFamily = 'monospace';
    fpsCounter.style.fontSize = '12px';
    fpsCounter.style.zIndex = '9999';
    document.body.appendChild(fpsCounter);
    this.fpsCounter = fpsCounter;
  }
  
  start() {
    if (this.frameId === null) {
      this.lastFrameTime = performance.now();
      this.frameId = requestAnimationFrame(this.update);
    }
  }
  
  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
  
  update(timestamp) {
    this.frameId = requestAnimationFrame(this.update);
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Update FPS counter
    this.frameCount++;
    if (timestamp - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
      this.lastFpsUpdate = timestamp;
      this.frameCount = 0;
      
      if (this.config.debug.showFPS && this.fpsCounter) {
        this.fpsCounter.textContent = `${this.fps} FPS`;
      }
    }
    
    // Update all active animations
    for (const [id, animation] of this.activeAnimations.entries()) {
      if (animation.update(deltaTime, timestamp)) {
        // Animation completed, remove it
        this.activeAnimations.delete(id);
      }
    }
    
    // Stop the loop if no animations are active
    if (this.activeAnimations.size === 0 && !this.config.debug.showFPS) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
      if (this.config.debug.logPerformanceMetrics) {
        console.log('Animation loop stopped - no active animations');
      }
    }
  }
  
  // Animation Registration Methods
  
  registerAnimation(animation) {
    const id = animation.id || `animation_${Math.random().toString(36).substr(2, 9)}`;
    animation.id = id;
    this.activeAnimations.set(id, animation);
    
    if (this.frameId === null) {
      this.start();
    }
    
    return id;
  }
  
  removeAnimation(id) {
    const result = this.activeAnimations.delete(id);
    
    if (this.activeAnimations.size === 0 && this.frameId !== null) {
      this.stop();
    }
    
    return result;
  }
  
  clearAllAnimations() {
    this.activeAnimations.clear();
    this.stop();
  }
  
  // Helper animations
  
  animateProperty(element, property, start, end, duration, easing = 'easeOutCubic', onComplete) {
    const animation = {
      id: `prop_${Math.random().toString(36).substr(2, 9)}`,
      element,
      property,
      startValue: start,
      endValue: end,
      startTime: performance.now(),
      duration,
      easing,
      onComplete,
      
      update(deltaTime, timestamp) {
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const easedProgress = this.getEasedProgress(progress, this.easing);
        
        const currentValue = this.startValue + (this.endValue - this.startValue) * easedProgress;
        
        // Apply the value
        if (typeof this.property === 'function') {
          // Custom setter function
          this.property(currentValue);
        } else {
          // Apply to element style
          if (this.property === 'opacity' || this.property === 'scale') {
            this.element.style[this.property] = currentValue;
          } else {
            this.element.style[this.property] = `${currentValue}px`;
          }
        }
        
        if (progress >= 1) {
          if (this.onComplete) this.onComplete();
          return true; // Animation complete
        }
        
        return false; // Animation not complete
      },
      
      getEasedProgress(p, easingName) {
        switch(easingName) {
          case 'linear': return p;
          case 'easeInQuad': return p * p;
          case 'easeOutQuad': return p * (2 - p);
          case 'easeInOutQuad': return p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          case 'easeInCubic': return p * p * p;
          case 'easeOutCubic': return (--p) * p * p + 1;
          case 'easeInOutCubic': return p < 0.5 ? 4 * p * p * p : (p - 1) * (2 * p - 2) * (2 * p - 2) + 1;
          default: return p;
        }
      }
    };
    
    return this.registerAnimation(animation);
  }
  
  fadeIn(element, duration = this.config.timing.fadeDuration, easing = 'easeOutCubic', onComplete) {
    element.style.opacity = '0';
    element.style.display = '';
    
    return this.animateProperty(element, 'opacity', 0, 1, duration, easing, onComplete);
  }
  
  fadeOut(element, duration = this.config.timing.fadeDuration, easing = 'easeInCubic', onComplete) {
    const completeHandler = () => {
      element.style.display = 'none';
      if (onComplete) onComplete();
    };
    
    return this.animateProperty(element, 'opacity', 1, 0, duration, easing, completeHandler);
  }
  
  createSmoothTypewriter(element, options = {}) {
    const defaultOptions = {
      text: '',
      typingSpeed: this.config.timing.typewriterBaseSpeed,
      deletingSpeed: this.config.timing.typewriterBaseSpeed * 1.5,
      startDelay: 0,
      showCursor: true,
      cursorChar: '|',
      highlightClass: null,
      onComplete: null,
      onCharTyped: null
    };
    
    const settings = {...defaultOptions, ...options};
    
    const typewriter = {
      id: `typewriter_${Math.random().toString(36).substr(2, 9)}`,
      element,
      settings,
      currentText: '',
      targetText: settings.text,
      charIndex: 0,
      isDeleting: false,
      isPaused: false,
      pauseUntil: 0,
      cursorElement: null,
      isFirstRender: true,
      
      initialize() {
        // Create a cursor element if needed
        if (this.settings.showCursor) {
          this.cursorElement = document.createElement('span');
          this.cursorElement.className = 'typewriter-cursor';
          this.cursorElement.textContent = this.settings.cursorChar;
          this.cursorElement.style.animation = 'typewriter-cursor-blink 0.7s infinite';
          this.element.appendChild(this.cursorElement);
        }
        
        // Apply hardware acceleration
        if (animationEngine.config.animations.useGPUAcceleration) {
          this.element.style.transform = 'translateZ(0)';
          this.element.style.willChange = 'contents';
        }
      },
      
      update(deltaTime, timestamp) {
        // Handle pause
        if (this.isPaused && timestamp < this.pauseUntil) {
          return false;
        } else if (this.isPaused) {
          this.isPaused = false;
        }
        
        // Handle start delay
        if (this.isFirstRender) {
          this.isFirstRender = false;
          if (this.settings.startDelay > 0) {
            this.pauseUntil = timestamp + this.settings.startDelay;
            this.isPaused = true;
            return false;
          }
        }
        
        // Handle typing
        if (!this.isDeleting) {
          if (this.charIndex < this.targetText.length) {
            this.charIndex++;
            this.currentText = this.targetText.substring(0, this.charIndex);
            
            // Apply to the element
            this.renderText();
            
            // Callback
            if (this.settings.onCharTyped) {
              this.settings.onCharTyped(this.charIndex, this.targetText[this.charIndex - 1]);
            }
            
            // Pause for the typing speed
            this.pauseUntil = timestamp + this.settings.typingSpeed;
            this.isPaused = true;
          } else {
            // Typing complete
            if (this.settings.onComplete) {
              this.settings.onComplete(true); // true = completed typing
            }
            return true; // Animation complete
          }
        } else {
          // Handle deleting
          if (this.charIndex > 0) {
            this.charIndex--;
            this.currentText = this.targetText.substring(0, this.charIndex);
            
            // Apply to the element
            this.renderText();
            
            // Pause for the deleting speed
            this.pauseUntil = timestamp + this.settings.deletingSpeed;
            this.isPaused = true;
          } else {
            // Deleting complete
            if (this.settings.onComplete) {
              this.settings.onComplete(false); // false = completed deleting
            }
            return true; // Animation complete
          }
        }
        
        return false; // Animation not complete
      },
      
      renderText() {
        let content;
        
        if (this.settings.highlightClass && this.targetText.includes('<span')) {
          // Use innerHTML if we have highlights
          content = this.currentText;
          this.element.innerHTML = content;
          
          // Re-add cursor if we're using innerHTML
          if (this.settings.showCursor && this.cursorElement) {
            this.element.appendChild(this.cursorElement);
          }
        } else {
          // Use textContent for simple text
          this.element.textContent = this.currentText;
          
          // Re-add cursor
          if (this.settings.showCursor && this.cursorElement) {
            this.element.appendChild(this.cursorElement);
          }
        }
      },
      
      // Public methods
      setText(newText, startTyping = true) {
        this.targetText = newText;
        if (startTyping) {
          this.charIndex = 0;
          this.currentText = '';
          this.isDeleting = false;
        }
      },
      
      deleteText() {
        this.isDeleting = true;
      },
      
      skipToEnd() {
        this.charIndex = this.targetText.length;
        this.currentText = this.targetText;
        this.renderText();
      }
    };
    
    typewriter.initialize();
    return typewriter;
  }
  
  // Event handling
  
  handleResize() {
    // Update any resize-dependent animations
    console.log('Window resized, updating animations');
  }
  
  // Intersection Observer for lazy animations
  createObserver(elements, options = {}) {
    if (!window.IntersectionObserver || !this.config.animations.useIntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      if (Array.isArray(elements)) {
        elements.forEach(el => options.onEnter(el));
      } else {
        options.onEnter(elements);
      }
      return null;
    }
    
    const defaultOptions = {
      threshold: 0.1,
      onEnter: () => {},
      onExit: () => {},
      once: true
    };
    
    const settings = {...defaultOptions, ...options};
    const elementArray = Array.isArray(elements) ? elements : [elements];
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          settings.onEnter(entry.target);
          if (settings.once) {
            observer.unobserve(entry.target);
          }
        } else if (!settings.once) {
          settings.onExit(entry.target);
        }
      });
    }, {
      root: settings.root || null,
      rootMargin: settings.rootMargin || '0px',
      threshold: settings.threshold
    });
    
    elementArray.forEach(el => observer.observe(el));
    
    const observerId = `observer_${Math.random().toString(36).substr(2, 9)}`;
    this.observers.set(observerId, { observer, elements: elementArray });
    
    return {
      id: observerId,
      disconnect: () => {
        if (this.observers.has(observerId)) {
          const { observer } = this.observers.get(observerId);
          observer.disconnect();
          this.observers.delete(observerId);
        }
      }
    };
  }
}

// Create the global animation engine instance
const animationEngine = new AnimationEngine();
window.animationEngine = animationEngine;

// Add enhanced typewriter function
window.createSmoothTypewriter = (element, options) => {
  return animationEngine.createSmoothTypewriter(element, options);
};

// Export methods as globals for easier use
window.fadeIn = (element, duration, easing, onComplete) => {
  return animationEngine.fadeIn(element, duration, easing, onComplete);
};

window.fadeOut = (element, duration, easing, onComplete) => {
  return animationEngine.fadeOut(element, duration, easing, onComplete);
};

document.addEventListener('DOMContentLoaded', () => {
  // Start the animation engine
  animationEngine.start();
});
