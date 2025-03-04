/**
 * Smooth Scroll Manager
 * Creates butter-smooth scrolling experience with parallax effects
 */
class SmoothScroll {
  constructor(options = {}) {
    this.options = Object.assign({
      friction: 0.075,
      acceleration: 0.12, 
      touchFriction: 0.3,
      parallaxElements: '.parallax',
      parallaxStrength: 0.1,
      scrollbarTheme: 'rose',
    }, options);
    
    this.container = document.body;
    this.scrollElements = {};
    this.lastScrollTop = 0;
    this.targetY = 0;
    this.currentY = 0;
    this.scrolling = false;
    this.resizeObserver = null;
    this.parallaxElements = [];
    this.ticking = false;
    this.hasCustomScrollbar = false;
    this.isTouching = false;
    this.isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Check if smooth scrolling should be enabled
    this.enabled = !this.isReduced && (
      !window.PERFORMANCE_CONFIG || 
      window.PERFORMANCE_CONFIG.animations.enableSmoothScroll !== false
    );
    
    // Initialize if enabled
    if (this.enabled) {
      this.init();
    }
  }

  init() {
    // Don't initialize if motion is reduced
    if (this.isReduced) return;
    
    // Create scrollable container
    this.createScrollContainer();
    
    // Find parallax elements
    this.findParallaxElements();
    
    // Initialize custom scrollbar if needed
    if (this.options.customScrollbar) {
      this.initCustomScrollbar();
    }
    
    // Set up event listeners
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.onResize.bind(this), { passive: true });
    
    // Initialize resize observer
    this.setupResizeObserver();
    
    // Touch events
    window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
    window.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    
    // Start animation
    this.animate();
  }

  createScrollContainer() {
    // Create the virtual scroller
    const wrapper = document.createElement('div');
    wrapper.classList.add('smooth-scroll-wrapper');
    
    // Style the wrapper
    Object.assign(wrapper.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      pointerEvents: 'none', // Let events pass through to content
      zIndex: 0
    });
    
    // Move all body children to the wrapper
    const content = document.createElement('div');
    content.classList.add('smooth-scroll-content');
    
    // Style the content
    Object.assign(content.style, {
      position: 'absolute', 
      top: 0,
      left: 0,
      width: '100%',
      willChange: 'transform',
      transform: 'translateY(0)',
      pointerEvents: 'all', // Re-enable pointer events for content
    });
    
    // Apply hardware acceleration
    content.style.transform = 'translate3d(0, 0, 0)';
    content.style.backfaceVisibility = 'hidden';
    
    // Move all body children into content
    while (document.body.firstChild) {
      // Skip if it's a script tag
      if (document.body.firstChild.tagName === 'SCRIPT') {
        const temp = document.body.firstChild;
        document.body.removeChild(temp);
        content.appendChild(temp);
        continue;
      }
      content.appendChild(document.body.firstChild);
    }
    
    // Add content to the wrapper, and wrapper to the body
    wrapper.appendChild(content);
    document.body.appendChild(wrapper);
    
    // Save references
    this.wrapper = wrapper;
    this.content = content;
    
    // Create a spacer element to maintain scroll height
    this.spacer = document.createElement('div');
    this.spacer.classList.add('smooth-scroll-spacer');
    this.spacer.style.height = '0px';
    document.body.appendChild(this.spacer);
    
    // Update the height
    this.updateHeight();
  }

  updateHeight() {
    // Get the full height of the content
    const contentHeight = this.content.getBoundingClientRect().height;
    
    // Update the spacer to match content height
    this.spacer.style.height = `${contentHeight}px`;
  }

  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(entries => {
        // Update the scroll height whenever content size changes
        this.updateHeight();
      });
      
      // Observe the content element
      this.resizeObserver.observe(this.content);
    } else {
      // Fallback for browsers without ResizeObserver
      setInterval(() => this.updateHeight(), 1000);
    }
  }

  findParallaxElements() {
    // Find all elements with parallax class
    this.parallaxElements = Array.from(document.querySelectorAll(this.options.parallaxElements));
    
    // Set initial positions
    this.parallaxElements.forEach(el => {
      // Get or set parallax strength
      const strength = parseFloat(el.dataset.parallaxStrength) || this.options.parallaxStrength;
      el.dataset.parallaxStrength = strength;
      
      // Set CSS for better performance
      el.style.willChange = 'transform';
      el.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  initCustomScrollbar() {
    this.hasCustomScrollbar = true;
    
    // Create scrollbar container
    this.scrollbar = document.createElement('div');
    this.scrollbar.classList.add('smooth-scrollbar', `scrollbar-${this.options.scrollbarTheme}`);
    
    // Style scrollbar container
    Object.assign(this.scrollbar.style, {
      position: 'fixed',
      top: '0',
      right: '4px',
      width: '8px',
      height: '100%',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });
    
    // Create scrollbar thumb
    this.scrollbarThumb = document.createElement('div');
    this.scrollbarThumb.classList.add('scrollbar-thumb');
    
    // Style scrollbar thumb
    Object.assign(this.scrollbarThumb.style, {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '100%',
      background: this.options.scrollbarTheme === 'rose' ? 
        'linear-gradient(to bottom, rgba(255,105,180,0.7), rgba(255,20,147,0.7))' : 
        'rgba(150, 150, 150, 0.5)',
      borderRadius: '4px',
      cursor: 'pointer',
      boxShadow: this.options.scrollbarTheme === 'rose' ? 
        '0 0 6px rgba(255,105,180,0.5)' : 
        '0 0 3px rgba(0,0,0,0.3)',
    });
    
    // Add scrollbar to the page
    this.scrollbar.appendChild(this.scrollbarThumb);
    document.body.appendChild(this.scrollbar);
    
    // Add event handlers for scrollbar interaction
    this.initScrollbarEvents();
  }

  initScrollbarEvents() {
    // Show scrollbar on scroll
    let scrollbarTimeout;
    window.addEventListener('scroll', () => {
      this.scrollbar.style.opacity = '1';
      
      clearTimeout(scrollbarTimeout);
      scrollbarTimeout = setTimeout(() => {
        this.scrollbar.style.opacity = '0';
      }, 1500);
    }, { passive: true });
    
    // Scrollbar drag functionality
    let isDragging = false;
    let startY, startScrollY;
    
    this.scrollbarThumb.addEventListener('mousedown', (e) => {
      isDragging = true;
      this.scrollbar.style.opacity = '1';
      startY = e.clientY;
      startScrollY = window.scrollY;
      
      document.body.style.userSelect = 'none'; // Prevent text selection during drag
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startY;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      
      const scrollRatio = viewportHeight / scrollHeight;
      const scrollDelta = deltaY / scrollRatio;
      
      window.scrollTo(0, startScrollY + scrollDelta);
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
        
        // Hide scrollbar after a delay
        setTimeout(() => {
          this.scrollbar.style.opacity = '0';
        }, 1500);
      }
    });
    
    // Hover effects
    this.scrollbar.addEventListener('mouseenter', () => {
      this.scrollbar.style.opacity = '1';
    });
    
    this.scrollbar.addEventListener('mouseleave', () => {
      if (!isDragging) {
        this.scrollbar.style.opacity = '0';
      }
    });
  }

  updateScrollbar() {
    if (!this.hasCustomScrollbar) return;
    
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Calculate thumb height and position
    const scrollRatio = viewportHeight / scrollHeight;
    const thumbHeight = Math.max(scrollRatio * viewportHeight, 40); // Minimum height
    const thumbTop = (scrollY / (scrollHeight - viewportHeight)) * (viewportHeight - thumbHeight);
    
    // Update thumb styles
    this.scrollbarThumb.style.height = `${thumbHeight}px`;
    this.scrollbarThumb.style.top = `${thumbTop}px`;
  }

  onScroll() {
    if (!this.ticking) {
      this.ticking = true;
      
      requestAnimationFrame(() => {
        this.targetY = -window.scrollY;
        this.scrolling = true;
        
        // Update scrollbar position if enabled
        if (this.hasCustomScrollbar) {
          this.updateScrollbar();
        }
        
        this.ticking = false;
      });
    }
  }

  onResize() {
    // Update the height on resize
    this.updateHeight();
  }

  onTouchStart() {
    this.isTouching = true;
  }

  onTouchEnd() {
    this.isTouching = false;
  }

  // Apply parallax transformations
  updateParallax() {
    // Calculate the scroll direction
    const scrollDirection = this.lastScrollTop > -this.targetY ? -1 : 1;
    this.lastScrollTop = -this.targetY;
    
    this.parallaxElements.forEach(el => {
      // Get the element's position relative to the viewport
      const rect = el.getBoundingClientRect();
      
      // Skip if element is not in view
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      
      // Get the strength from the data attribute
      const strength = parseFloat(el.dataset.parallaxStrength) || 0.1;
      
      // Calculate parallax offset based on element position
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distFromCenter = elementCenter - viewportCenter;
      
      // Apply transformation with direction and strength factors
      const parallaxOffset = distFromCenter * strength * scrollDirection * 0.1;
      
      el.style.transform = `translate3d(0, ${parallaxOffset}px, 0)`;
    });
  }

  animate() {
    if (this.enabled) {
      // Calculate the new position with inertia
      let friction = this.options.friction;
      
      // Adjust friction based on touch state
      if (this.isTouching) {
        friction = this.options.touchFriction;
      }
      
      // Calculate the delta with easing
      this.currentY += (this.targetY - this.currentY) * friction;
      
      // Apply the transform with rounded value to avoid subpixel rendering
      this.content.style.transform = `translate3d(0, ${Math.round(this.currentY * 100) / 100}px, 0)`;
      
      // Update parallax elements
      this.updateParallax();
    }
    
    // Continue animation loop
    requestAnimationFrame(this.animate.bind(this));
  }

  scrollTo(target, options = {}) {
    const defaults = {
      offset: 0,
      duration: 1000,
      easing: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      callback: null
    };
    
    const settings = Object.assign({}, defaults, options);
    
    // Get target position
    let targetPosition;
    if (typeof target === 'number') {
      targetPosition = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (!element) return;
      targetPosition = element.getBoundingClientRect().top + window.scrollY;
    } else if (target instanceof HTMLElement) {
      targetPosition = target.getBoundingClientRect().top + window.scrollY;
    } else {
      return;
    }
    
    // Apply offset
    targetPosition += settings.offset;
    
    // Get start position
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    
    // Don't animate for tiny distances
    if (Math.abs(distance) < 10) {
      window.scrollTo(0, targetPosition);
      if (settings.callback) settings.callback();
      return;
    }
    
    // Set up timing
    let startTime = null;
    
    // Animation step
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / settings.duration, 1);
      const easedProgress = settings.easing(progress);
      
      window.scrollTo(0, startPosition + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (settings.callback) settings.callback();
      }
    }
    
    // Start animation
    requestAnimationFrame(step);
  }

  // Clean up event listeners
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchend', this.onTouchEnd);
    
    // Remove DOM elements
    if (this.spacer && this.spacer.parentNode) {
      this.spacer.parentNode.removeChild(this.spacer);
    }
    
    if (this.hasCustomScrollbar && this.scrollbar && this.scrollbar.parentNode) {
      this.scrollbar.parentNode.removeChild(this.scrollbar);
    }
    
    // Restore original DOM structure
    if (this.wrapper && this.content) {
      while (this.content.firstChild) {
        document.body.appendChild(this.content.firstChild);
      }
      
      if (this.wrapper.parentNode) {
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }
  }
}

// Initialize smooth scroll when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create smooth scroll instance
  window.smoothScroll = new SmoothScroll({
    friction: 0.085,
    acceleration: 0.15,
    customScrollbar: true,
    scrollbarTheme: 'rose'
  });
  
  // Add smooth scroll to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      if (window.smoothScroll && window.smoothScroll.enabled) {
        window.smoothScroll.scrollTo(targetId, {
          offset: -50,
          duration: 1200,
          easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
        });
      } else {
        // Fallback for when smooth scroll is disabled
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});

// Add CSS for smooth scrolling
(() => {
  const style = document.createElement('style');
  style.textContent = `
    html {
      scroll-behavior: smooth;
    }
    
    body {
      overflow-x: hidden;
    }
    
    .parallax {
      will-change: transform;
    }
    
    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
    }
    
    .smooth-scrollbar::-webkit-scrollbar {
      display: none;
    }
    
    .scrollbar-rose .scrollbar-thumb {
      background: linear-gradient(to bottom, rgba(255,105,180,0.7), rgba(255,20,147,0.7));
      box-shadow: 0 0 6px rgba(255,105,180,0.5);
    }
  `;
  document.head.appendChild(style);
})();
