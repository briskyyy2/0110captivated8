/**
 * Advanced Particle System
 * Creates beautiful particle effects with hardware acceleration
 */
class ParticleSystem {
  constructor(options = {}) {
    const defaults = {
      container: document.body,
      particleCount: 100,
      particleSize: [3, 8],
      colors: ['#ff9ff3', '#fe75fe', '#d84aaa', '#ffcbe5'],
      speedRange: [0.5, 2],
      fadeSpeed: 0.02,
      gravity: 0.05,
      turbulence: 0.1,
      lifetime: [2000, 8000],
      shape: 'circle', // 'circle', 'square', 'heart', 'star', 'custom'
      customShape: null, // SVG path for custom shape
      blendMode: 'screen', // 'normal', 'screen', 'multiply', 'overlay'
      useGlow: true,
      glowRadius: 10,
      glowColor: 'rgba(255, 105, 180, 0.3)',
      zIndex: 1000,
      spawnRate: 0, // Particles per second (0 for manual spawning)
      respawn: false, // Whether particles should respawn when they die
      autoStart: false
    };
    
    this.config = { ...defaults, ...options };
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.particlesCreated = 0;
    this.useGPU = window.PERFORMANCE_CONFIG?.animations?.useGPUAcceleration !== false;
    
    // Bind methods
    this.update = this.update.bind(this);
    this.init();
    
    if (this.config.autoStart) {
      this.start();
    }
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = this.config.zIndex;
    
    // Apply hardware acceleration
    if (this.useGPU) {
      this.canvas.style.transform = 'translateZ(0)';
      this.canvas.style.willChange = 'transform';
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resizeCanvas();
    
    // Add to container
    if (typeof this.config.container === 'string') {
      this.config.container = document.querySelector(this.config.container);
    }
    this.config.container.appendChild(this.canvas);
    
    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Initialize particles if we have a config count
    if (this.config.particleCount > 0) {
      this.createParticles(this.config.particleCount);
    }
    
    console.log(`Particle system initialized with ${this.config.particleCount} particles`);
  }
  
  resizeCanvas() {
    const container = this.config.container;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set display size
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    // Set actual size with DPR adjustment
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    // Scale the context
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
  }
  
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.update);
      
      // Setup spawn interval if needed
      if (this.config.spawnRate > 0) {
        this.spawnInterval = setInterval(() => {
          const spawnCount = Math.ceil(this.config.spawnRate / 10); // Spawn every 100ms
          this.createParticles(spawnCount);
        }, 100);
      }
    }
  }
  
  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      if (this.spawnInterval) {
        clearInterval(this.spawnInterval);
        this.spawnInterval = null;
      }
    }
  }
  
  createParticles(count, options = {}) {
    for (let i = 0; i < count; i++) {
      // Get size from range or specific value
      let size;
      if (Array.isArray(this.config.particleSize)) {
        size = Math.random() * (this.config.particleSize[1] - this.config.particleSize[0]) + this.config.particleSize[0];
      } else {
        size = this.config.particleSize;
      }
      
      // Get color
      const colorIndex = Math.floor(Math.random() * this.config.colors.length);
      const color = this.config.colors[colorIndex];
      
      // Get lifetime
      let lifetime;
      if (Array.isArray(this.config.lifetime)) {
        lifetime = Math.random() * (this.config.lifetime[1] - this.config.lifetime[0]) + this.config.lifetime[0];
      } else {
        lifetime = this.config.lifetime;
      }
      
      // Get speed
      let speed;
      if (Array.isArray(this.config.speedRange)) {
        speed = Math.random() * (this.config.speedRange[1] - this.config.speedRange[0]) + this.config.speedRange[0];
      } else {
        speed = this.config.speedRange;
      }
      
      // Default spawn position (if not specified in options)
      const x = options.x !== undefined ? options.x : Math.random() * this.width;
      const y = options.y !== undefined ? options.y : Math.random() * this.height;
      
      // Calculate velocity components
      const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      // Create particle
      const particle = {
        id: this.particlesCreated++,
        x,
        y,
        vx,
        vy,
        size,
        color,
        alpha: options.startAlpha || 1,
        lifetime,
        birth: performance.now(),
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        shape: options.shape || this.config.shape,
        turbulenceOffsetX: Math.random() * 1000,
        turbulenceOffsetY: Math.random() * 1000,
        // Allow overriding any property
        ...options
      };
      
      this.particles.push(particle);
    }
  }
  
  createFromPoint(x, y, count, options = {}) {
    this.createParticles(count, { x, y, ...options });
  }
  
  createExplosion(x, y, count, options = {}) {
    const defaults = {
      speedRange: [1, 5],
      particleSize: [2, 8],
      gravity: 0.1
    };
    
    const settings = { ...defaults, ...options, x, y };
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      let speed;
      
      if (Array.isArray(settings.speedRange)) {
        speed = Math.random() * (settings.speedRange[1] - settings.speedRange[0]) + settings.speedRange[0];
      } else {
        speed = settings.speedRange;
      }
      
      const particleOptions = {
        ...settings,
        angle,
        speed
      };
      
      this.createParticles(1, particleOptions);
    }
  }
  
  createHeartShower(count, options = {}) {
    const defaults = {
      shape: 'heart',
      colors: ['#ff6b6b', '#ff9ff3', '#fe75fe', '#feca57'],
      speedRange: [0.8, 2],
      gravity: 0.05,
      particleSize: [10, 25],
      useGlow: true
    };
    
    const settings = { ...defaults, ...options };
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.width;
      const y = -50 - Math.random() * 100; // Start above screen
      
      this.createParticles(1, {
        ...settings,
        x,
        y,
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.3 // Mostly downward
      });
    }
  }
  
  update(timestamp) {
    if (!this.isRunning) return;
    
    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.update);
    
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Set blend mode
    this.ctx.globalCompositeOperation = this.config.blendMode;
    
    // Update and render particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity
      p.vy += p.gravity || this.config.gravity;
      
      // Apply turbulence if enabled
      if (this.config.turbulence > 0) {
        p.turbulenceOffsetX += 0.01;
        p.turbulenceOffsetY += 0.01;
        p.x += Math.sin(p.turbulenceOffsetX) * this.config.turbulence;
        p.y += Math.cos(p.turbulenceOffsetY) * this.config.turbulence;
      }
      
      // Update rotation
      p.rotation += p.rotationSpeed;
      
      // Update alpha based on lifetime
      const age = timestamp - p.birth;
      if (age < 200) {
        // Fade in
        p.alpha = Math.min(1, age / 200);
      } else if (age > p.lifetime - 500) {
        // Fade out
        p.alpha = Math.max(0, (p.lifetime - age) / 500);
      }
      
      // Check if particle is dead
      if (age >= p.lifetime || 
          p.x < -100 || p.x > this.width + 100 || 
          p.y < -100 || p.y > this.height + 100) {
        
        // Remove particle
        this.particles.splice(i, 1);
        
        // Respawn if needed
        if (this.config.respawn) {
          this.createParticles(1);
        }
        
        continue;
      }
      
      // Render particle
      this.renderParticle(p);
    }
    
    // Restore blend mode
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  renderParticle(p) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.globalAlpha = p.alpha;
    
    // Draw glow if enabled
    if (this.config.useGlow && p.useGlow !== false) {
      const glow = p.glowRadius || this.config.glowRadius;
      const glowColor = p.glowColor || this.config.glowColor;
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glow * 2);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, glow * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw the particle based on shape
    ctx.fillStyle = p.color;
    
    switch(p.shape) {
      case 'square':
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        break;
        
      case 'heart':
        this.drawHeart(ctx, p.size);
        break;
        
      case 'star':
        this.drawStar(ctx, p.size);
        break;
        
      case 'custom':
        if (p.customPath) {
          const path = new Path2D(p.customPath);
          ctx.fill(path);
        }
        break;
        
      case 'circle':
      default:
        ctx.beginPath();
        ctx.arc(0, 0, p.size/2, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }
  
  drawHeart(ctx, size) {
    const scale = size / 30;
    
    ctx.beginPath();
    ctx.moveTo(0, 5 * scale);
    
    // Left curve
    ctx.bezierCurveTo(
      -10 * scale, -10 * scale,
      -20 * scale, 0,
      0, 15 * scale
    );
    
    // Right curve
    ctx.bezierCurveTo(
      20 * scale, 0,
      10 * scale, -10 * scale,
      0, 5 * scale
    );
    
    ctx.fill();
  }
  
  drawStar(ctx, size) {
    const outerRadius = size / 2;
    const innerRadius = outerRadius / 2;
    const spikes = 5;
    
    ctx.beginPath();
    ctx.moveTo(0, -outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      const outerAngle = Math.PI / spikes * (i * 2);
      const innerAngle = Math.PI / spikes * (i * 2 + 1);
      
      // Outer point
      ctx.lineTo(
        Math.sin(outerAngle) * outerRadius,
        -Math.cos(outerAngle) * outerRadius
      );
      
      // Inner point
      ctx.lineTo(
        Math.sin(innerAngle) * innerRadius,
        -Math.cos(innerAngle) * innerRadius
      );
    }
    
    ctx.closePath();
    ctx.fill();
  }
  
  // Utility methods
  
  clear() {
    this.particles = [];
  }
  
  setParticleCount(count) {
    const diff = count - this.particles.length;
    
    if (diff > 0) {
      // Add particles
      this.createParticles(diff);
    } else if (diff < 0) {
      // Remove particles
      this.particles.splice(0, -diff);
    }
  }
  
  setBlendMode(mode) {
    this.config.blendMode = mode;
  }
  
  resize() {
    this.resizeCanvas();
  }
  
  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Create global instance
window.particleSystem = new ParticleSystem({
  autoStart: true,
  particleCount: 0 // No particles by default, will be created on demand
});

// Helper functions
window.createHeartShower = (count = 30, options = {}) => {
  window.particleSystem.createHeartShower(count, options);
};

window.createParticleExplosion = (x, y, count = 50, options = {}) => {
  window.particleSystem.createExplosion(x, y, count, options);
};
