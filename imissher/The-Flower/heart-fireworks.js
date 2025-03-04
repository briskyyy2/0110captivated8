const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const random = (min, max) => Math.random() * (max - min) + min;

// Expanded soft, cute color palette - carefully curated harmonious pairs
const softColorPairs = [
  // Each entry is [primaryColor, secondaryColor]
  // Pink and purple combinations
  ['hsl(350, 100%, 80%)', 'hsl(280, 90%, 85%)'], // Light pink + lavender
  ['hsl(330, 100%, 85%)', 'hsl(260, 85%, 90%)'], // Soft rose + light purple
  ['hsl(340, 95%, 83%)', 'hsl(290, 90%, 87%)'],  // Bubblegum pink + lilac
  ['hsl(355, 95%, 85%)', 'hsl(325, 90%, 80%)'],  // Blush pink + deeper pink
  ['hsl(315, 90%, 85%)', 'hsl(285, 85%, 80%)'],  // Magenta + violet
  ['hsl(335, 100%, 87%)', 'hsl(305, 85%, 83%)'], // Cotton candy pink + orchid
  ['hsl(345, 90%, 82%)', 'hsl(320, 85%, 90%)'],  // Rose pink + light magenta
  
  // Purple combinations
  ['hsl(270, 85%, 85%)', 'hsl(290, 80%, 90%)'],  // Soft purple + light magenta
  ['hsl(285, 80%, 80%)', 'hsl(265, 75%, 90%)'],  // Medium purple + light lavender
  ['hsl(300, 85%, 80%)', 'hsl(320, 75%, 85%)'],  // Orchid + soft pink
  
  // Blue combinations
  ['hsl(210, 100%, 85%)', 'hsl(240, 90%, 90%)'], // Sky blue + periwinkle
  ['hsl(195, 95%, 85%)', 'hsl(170, 90%, 90%)'],  // Light blue + aqua mint
  ['hsl(225, 90%, 88%)', 'hsl(255, 85%, 85%)'],  // Periwinkle + soft violet
  ['hsl(185, 85%, 85%)', 'hsl(215, 80%, 90%)'],  // Aqua + baby blue
  ['hsl(200, 90%, 85%)', 'hsl(220, 85%, 90%)'],  // Powder blue + soft blue
  
  // Soft teal/mint/aqua combinations
  ['hsl(160, 90%, 85%)', 'hsl(120, 85%, 90%)'],  // Mint + soft green
  ['hsl(175, 95%, 85%)', 'hsl(195, 90%, 90%)'],  // Aqua + light blue
  ['hsl(165, 85%, 87%)', 'hsl(185, 80%, 92%)'],  // Soft seafoam + pale aqua
  ['hsl(155, 75%, 85%)', 'hsl(175, 70%, 90%)'],  // Sage mint + soft teal
  
  // Soft coral/peach (not pure yellow)
  ['hsl(15, 80%, 87%)', 'hsl(350, 85%, 90%)'],   // Soft coral + light pink
  ['hsl(20, 75%, 88%)', 'hsl(0, 70%, 92%)'],     // Pale peach + barely pink
  ['hsl(25, 70%, 90%)', 'hsl(355, 75%, 85%)'],   // Cream peach + blush
  
  // Monochromatic pinks (different shades)
  ['hsl(345, 100%, 80%)', 'hsl(345, 100%, 90%)'], // Deeper pink + lighter pink
  ['hsl(330, 95%, 85%)', 'hsl(335, 95%, 75%)'],   // Medium pink + slightly deeper pink
  ['hsl(350, 95%, 82%)', 'hsl(350, 95%, 92%)'],   // Rose pink + pale rose
  
  // Monochromatic purples
  ['hsl(275, 90%, 85%)', 'hsl(275, 90%, 75%)'],   // Light purple + deeper purple
  ['hsl(295, 85%, 85%)', 'hsl(295, 85%, 95%)'],   // Medium purple + lighter purple
  ['hsl(265, 80%, 85%)', 'hsl(265, 80%, 95%)'],   // Lavender + pale lavender
  
  // Monochromatic blues
  ['hsl(215, 95%, 85%)', 'hsl(215, 95%, 75%)'],   // Light blue + deeper blue
  ['hsl(230, 90%, 88%)', 'hsl(230, 90%, 78%)'],   // Soft blue + deeper soft blue
  ['hsl(195, 85%, 88%)', 'hsl(195, 85%, 78%)'],   // Sky blue + deeper sky blue
];

// Get a random color with a secondary color variant
function getRandomColor() {
  // Use static variable to track last few colors to prevent repetition
  if (!getRandomColor.lastColors) {
    getRandomColor.lastColors = [];
  }
  
  let colorPair;
  let attempts = 0;
  const maxAttempts = 10;
  
  // Try to find a color that hasn’t been used recently
  do {
    // 80% chance to use a curated color pair
    if (Math.random() < 0.8) {
      const pairIndex = Math.floor(Math.random() * softColorPairs.length);
      colorPair = {
        color: softColorPairs[pairIndex][0],
        secondaryColor: softColorPairs[pairIndex][1]
      };
    } else {
      // 20% chance to generate a custom color
      // Pink has a higher chance
      if (Math.random() < 0.6) {
        // Pink colors with slight variations
        const hue = random(330, 355); // Pink range
        const saturation = random(85, 100);
        const lightness = random(75, 85);
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // For pink, use a monochromatic approach (same hue, different brightness)
        const secondaryLightness = Math.min(95, lightness + random(8, 12));
        const secondaryColor = `hsl(${hue}, ${saturation}%, ${secondaryLightness}%)`;
        
        colorPair = { color, secondaryColor };
      } else {
        // Other pastel colors
        const hue = random(0, 360);
        const saturation = random(80, 95);
        const lightness = random(80, 90);
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        
        // Monochromatic secondary color (same hue, different lightness)
        let secondaryLightness;
        if (Math.random() < 0.7) {
          // Usually go lighter
          secondaryLightness = Math.min(95, lightness + random(7, 15));
        } else {
          // Sometimes go darker
          secondaryLightness = Math.max(65, lightness - random(10, 15));
        }
        const secondaryColor = `hsl(${hue}, ${saturation}%, ${secondaryLightness}%)`;
        
        colorPair = { color, secondaryColor };
      }
    }
    
    // Check if this color is in our last 5 colors
    const isRepeated = getRandomColor.lastColors.some(lastColor => 
      lastColor === colorPair.color
    );
    
    attempts++;
    // Accept the color if it’s not repeated or we’ve tried too many times
    if (!isRepeated || attempts >= maxAttempts) break;
    
  } while (true);
  
  // Add to tracking array and remove oldest if needed
  getRandomColor.lastColors.push(colorPair.color);
  if (getRandomColor.lastColors.length > 5) {
    getRandomColor.lastColors.shift(); // Remove oldest color
  }
  
  return colorPair;
}

class Star {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(0, canvas.width);
    this.y = random(0, canvas.height);
    this.size = random(0.5, 1.5);
    this.baseAlpha = random(0.3, 0.8);
    this.alpha = this.baseAlpha;
    this.twinkleSpeed = random(0.005, 0.02);
    this.twinkleDirection = Math.random() < 0.5 ? 1 : -1;
  }

  update() {
    this.alpha += this.twinkleSpeed * this.twinkleDirection;
    if (this.alpha >= 1) {
      this.alpha = 1;
      this.twinkleDirection = -1;
    } else if (this.alpha <= this.baseAlpha) {
      this.alpha = this.baseAlpha;
      this.twinkleDirection = 1;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
}

class Firework {
  constructor(isFirstFirework = false) {
    this.isFirstFirework = isFirstFirework;
    this.reset();
  }

  reset() {
    // Center the x position horizontally
    this.x = canvas.width / 2;
    this.y = canvas.height;
    
    // Set speed - first firework has a consistent, moderately fast speed
    if (this.isFirstFirework) {
      this.speed = 4.0; // Slightly increased from 3.5
    } else {
      this.speed = random(3, 7); // Regular fireworks have variable speed
    }
    
    // Launch angle - vary more for regular fireworks
    let angle;
    if (this.isFirstFirework) {
      // First firework goes straight up
      angle = -Math.PI / 2;
    } else {
      // Regular fireworks have more varied trajectories
      angle = random((-Math.PI / 2) - 0.3, (-Math.PI / 2) + 0.3);
      
      // Randomize starting position for regular fireworks
      this.x = random(canvas.width * 0.2, canvas.width * 0.8);
    }
    
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.gravity = 0.015;
    
    // Get color with possible secondary color for the entire firework
    if (this.isFirstFirework) {
      // First firework is always pink
      const hue = random(340, 350); // Consistent pink range
      const saturation = random(90, 100);
      const lightness = random(75, 80);
      this.color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      // Secondary color is always purplish for better combination
      const secondaryHue = random(270, 290); // Purple range
      const secondarySat = random(85, 95);
      const secondaryLight = random(75, 85);
      this.secondaryColor = `hsl(${secondaryHue}, ${secondarySat}%, ${secondaryLight}%)`;
    } else {
      // Regular fireworks use random colors
      const colorData = getRandomColor();
      this.color = colorData.color;
      this.secondaryColor = colorData.secondaryColor;
    }
    
    this.exploded = false;
    this.particles = [];
    
    // Set target - first firework always explodes in the center middle, slightly to the top
    if (this.isFirstFirework) {
      // Force the first firework to always explode at the center, 35% from top
      this.targetY = canvas.height * 0.35;
      // Ensure horizontal position is centered
      this.x = canvas.width / 2;
      // Reset horizontal velocity to ensure straight upward path
      this.vx = 0;
    } else {
      // Regular fireworks have variable target heights
      this.targetY = random(canvas.height * 0.25, canvas.height * 0.6);
    }
    
    this.history = [];
    this.maxHistory = this.isFirstFirework ? 30 : 20; // All fireworks get longer trails now
    this.done = false;
    this.size = 1.5;
    this.progress = 0; // Track animation progress from 0 to 1
    this.startTime = Date.now(); // When the firework was created
    this.explodeTime = 0; // When the firework exploded
    this.totalDuration = 2000; // Expected total duration in ms
  }

  update() {
    if (!this.exploded) {
      this.vy += this.gravity;
      
      if (this.isFirstFirework) {
        // Keep x centered for first firework with just tiny random variation
        this.x = canvas.width / 2 + random(-0.5, 0.5);
        this.y += this.vy;
        
        // Explode precisely at target height for first firework
        if (this.y <= this.targetY) {
          this.explode();
        }
      } else {
        this.x += this.vx + random(-0.5, 0.5);
        this.y += this.vy;
      }

      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      if (this.vy >= 0 || this.y <= this.targetY) {
        this.exploded = true;
        this.explode();
        this.explodeTime = Date.now();
      }
      
      // Progress is 0-0.3 during launch phase
      this.progress = Math.min(0.3, (Date.now() - this.startTime) / this.totalDuration);
    } else {
      // After explosion, progress goes from 0.3 to 1.0
      const timeAfterExplosion = Date.now() - this.explodeTime;
      const explosionDuration = this.totalDuration * 0.7; // 70% of time is for explosion
      this.progress = 0.3 + Math.min(0.7, timeAfterExplosion / explosionDuration);
    }

    this.particles.forEach((particle) => particle.update());
    this.particles = this.particles.filter((particle) => !particle.done);

    if (this.exploded && this.particles.length === 0) {
      this.done = true;
      this.progress = 1;
      // If this firework is done and autoLaunch is enabled, create a new one with a delay
      if (autoLaunch && !newFireworkPending) {
        newFireworkPending = true;
        setTimeout(() => {
          createFirework();
          newFireworkPending = false;
        }, 300); // Reduced from 1000ms (1 second) to 300ms (0.3 seconds)
      }
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.save();
      
      // All fireworks now use the comet-like dotted trail
      ctx.globalAlpha = 0.8;
      ctx.globalCompositeOperation = "lighter";
      
      // Dotted trail parameters (first firework remains special with slightly larger dots)
      const dotSize = this.isFirstFirework ? 3.2 : 2.8;
      const dotSpacing = 1; // Every point gets a dot for tighter spacing
      
      // Draw dots along the path with decreasing size
      for (let i = 0; i < this.history.length; i++) {
        const point = this.history[i];
        // Calculate progress - largest at newest point (end of array)
        const progress = i / this.history.length; // 0 at start (tail), 1 at end (head)
        
        // Dot size increases toward the head (comet-like)
        const size = dotSize * progress;
        
        // Only draw dots at certain intervals for a dotted effect
        if (i % dotSpacing === 0) {
          // Create a glow effect for each dot
          const glowRadius = size * 2.0;
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, glowRadius
          );
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(point.x, point.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the dot itself
          ctx.beginPath();
          ctx.fillStyle = this.color;
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    } else {
      this.particles.forEach((particle) => particle.draw());
    }
  }

  explode() {
    // Balance between performance and aesthetics
    const particleCount = 40; 
    
    // Use the same colors assigned at creation time
    const mainColor = this.color;
    const secondaryColor = this.secondaryColor;
    
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      // Heart curve parametric equations with increased size
      const x = 16 * Math.pow(Math.sin(t), 3) * this.size * 2.5; 
      const y = -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * this.size * 2.5; 
      const angle = Math.atan2(y, x);
      const speed = Math.sqrt(x * x + y * y) / 5;
      
      this.particles.push(
        new Particle(this.x, this.y, mainColor, angle, speed, secondaryColor)
      );
    }
  }
}

class Particle {
  constructor(
    x,
    y,
    color,
    angle = null,
    speed = null,
    secondaryColor = null
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.secondaryColor = secondaryColor || color; // Use secondary color if provided
    this.size = random(3, 5); 
    this.speed = speed !== null ? speed : random(2, 8); 
    this.angle = angle !== null ? angle : random(0, Math.PI * 2);
    this.gravity = 0.035; 
    this.friction = 0.975; 
    this.opacity = 1;
    this.done = false;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.decay = random(0.008, 0.015); // Slower decay rate for longer trails
    this.history = [];
    this.maxHistory = 12; // Increased from 8 to 12 for longer trails
    // For particles with secondary color, smoothly transition between colors
    this.colorTransition = Math.random(); // Random starting point in the transition
    this.colorTransitionSpeed = random(0.01, 0.03); // How fast to cycle colors
  }

  update() {
    // Add small wind effect back for more natural movement
    const wind = 0.001;
    this.vx += wind * (Math.random() - 0.5);
    
    this.history.push({ x: this.x, y: this.y });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= this.decay;

    // Update color transition if we have a secondary color
    if (this.color !== this.secondaryColor) {
      this.colorTransition = (this.colorTransition + this.colorTransitionSpeed) % 1;
    }

    if (this.opacity <= 0.02) {
      this.done = true;
    }
  }

  draw() {
    // Get current color (either the main color or a blend if we have a secondary color)
    let currentColor = this.color;
    if (this.color !== this.secondaryColor) {
      // Simple color transition: if secondaryColor exists, use it for a more colorful effect
      currentColor = Math.random() < 0.5 ? this.color : this.secondaryColor;
    }
    
    ctx.save();
    ctx.globalCompositeOperation = "lighter"; // Make overlapping elements brighter for better blending

    // Draw larger, faint circle behind the particle for better blending with trails
    const gradientSize = this.size * 3.0; // Increased from 2.5 to 3.0 for larger glow
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, gradientSize
    );
    gradient.addColorStop(0, currentColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.globalAlpha = this.opacity * 0.6; // Increased from 0.5 to 0.6 for more visibility
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, gradientSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw comet-like trails that taper from head to tail
    if (this.history.length > 1) {
      // Loop through history points in reverse to draw from head to tail
      for (let i = this.history.length - 1; i > 0; i--) {
        const point = this.history[i];
        const prevPoint = this.history[i - 1];
        
        // Calculate taper factor - trails should get thinner toward the tail
        const taperFactor = i / this.history.length;
        
        // Calculate opacity that fades toward the tail
        const trailOpacity = this.opacity * taperFactor * 0.9; // Increased from 0.85 to 0.9
        
        // Draw each segment of the trail with enhanced glow
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(prevPoint.x, prevPoint.y);
        ctx.strokeStyle = currentColor;
        ctx.globalAlpha = trailOpacity;
        ctx.lineWidth = this.size * 1.2 * taperFactor; // Increased from 1.1 to 1.2
        ctx.stroke();
      }
    }

    // Draw head particle
    ctx.globalAlpha = this.opacity * 0.9;
    ctx.shadowBlur = 12; 
    ctx.shadowColor = currentColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
    
    ctx.restore();
  }
}

let fireworks = [];
const stars = [];
let autoLaunch = true;
let newFireworkPending = false; 
let canLaunchNext = true; // Flag to control when next firework can be launched
let lastFireworkTime = 0;
const fireworkCooldown = 2000; // 2000ms (2 seconds) cooldown between fireworks

function addFirework(x, y, isFirstFirework = false) {
  const currentTime = Date.now();
  
  // Only add a new firework if enough time has passed or it’s the first one
  if (isFirstFirework || currentTime - lastFireworkTime >= fireworkCooldown) {
    fireworks.push(new Firework(isFirstFirework));
    lastFireworkTime = currentTime;
    
    // Launch the first firework immediately on startup
    if (firstFireworkLaunched === false && isFirstFirework) {
      firstFireworkLaunched = true;
    }
  }
}

const starCount = 100;
for (let i = 0; i < starCount; i++) {
  stars.push(new Star());
}

const createFirework = () => {
  // Only create a new firework if there are none active and none pending
  if (fireworks.length === 0 && !newFireworkPending) {
    addFirework(canvas.width / 2, canvas.height, true);
  }
};

// Start with just one firework
// Removing this line so no firework launches automatically
// createFirework();

const drawBackground = () => {
  // Clear the canvas with full transparency instead of drawing a gradient
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Stars are no longer needed with transparent background
  // Keeping the function structure in case you want to restore stars later
};

const animate = () => {
  requestAnimationFrame(animate);

  // First clear with full transparency
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Then add the fading effect but with transparency instead of background color
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Partially clear previous frame to create trails
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw with additive blending
  ctx.globalCompositeOperation = "lighter";

  // Update and draw fireworks
  fireworks.forEach((firework) => firework.update());
  fireworks.forEach((firework) => firework.draw());

  // Remove done fireworks
  fireworks = fireworks.filter((firework) => !firework.done);
};

animate();

// Event listener for firework creation on click
canvas.addEventListener("click", (e) => {
  // If there are other fireworks, create a regular one
  if (fireworks.length > 0) {
    addFirework(e.clientX, e.clientY, false);
  } else {
    // First click should create a special first firework
    addFirework(e.clientX, e.clientY, true);
  }
});
