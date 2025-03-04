/**
 * Simple Audio Manager
 * Handles sound effects with graceful fallbacks and performance optimization
 */
class AudioManager {
  constructor(options = {}) {
    this.options = Object.assign({
      volume: 0.5,
      enabled: true,
      sounds: {},
      fadeTime: 500,
      crossOrigin: 'anonymous'
    }, options);
    
    this.sounds = new Map();
    this.enabled = this.options.enabled;
    this.volume = this.options.volume;
    this.muted = false;
    this.context = null;
    
    // Check if audio should be enabled based on performance config
    if (window.PERFORMANCE_CONFIG && window.PERFORMANCE_CONFIG.audio === false) {
      this.enabled = false;
    }
    
    // Check for reduced motion preference (likely want reduced sound too)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.volume = Math.min(this.volume, 0.3); // Reduce volume but don't disable completely
    }
    
    this.initAudioContext();
    this.loadDefaultSounds();
  }
  
  // Initialize Web Audio API context
  initAudioContext() {
    if (!this.enabled) return;
    
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      
      if (AudioContext) {
        this.context = new AudioContext();
        
        // Create master gain node
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.context.destination);
        
        // Resume audio context on user interaction
        const resumeAudio = () => {
          if (this.context && this.context.state === 'suspended') {
            this.context.resume();
          }
          
          // Remove event listeners after first interaction
          ['click', 'touchstart', 'keydown'].forEach(event => {
            document.removeEventListener(event, resumeAudio);
          });
        };
        
        // Add event listeners for user interaction
        ['click', 'touchstart', 'keydown'].forEach(event => {
          document.addEventListener(event, resumeAudio, { once: true });
        });
      } else {
        console.log('Web Audio API not supported in this browser');
        this.enabled = false;
      }
    } catch (e) {
      console.log('Error initializing audio context:', e);
      this.enabled = false;
    }
  }
  
  // Load default sound effects
  loadDefaultSounds() {
    // Define default sounds
    const defaultSounds = {
      click: {
        url: 'https://assets.codepen.io/217233/click.mp3',
        volume: 0.5
      },
      hover: {
        url: 'https://assets.codepen.io/217233/hover.mp3',
        volume: 0.3
      },
      success: {
        url: 'https://assets.codepen.io/217233/success.mp3',
        volume: 0.6
      },
      magic: {
        url: 'https://assets.codepen.io/217233/magic.mp3',
        volume: 0.7
      },
      heart: {
        url: 'https://assets.codepen.io/217233/pop.mp3',
        volume: 0.6
      }
    };
    
    // Load default sounds
    for (const [id, sound] of Object.entries(defaultSounds)) {
      this.load(id, sound.url, { volume: sound.volume });
    }
    
    // Load custom sounds from options
    for (const [id, sound] of Object.entries(this.options.sounds)) {
      this.load(id, sound.url, { volume: sound.volume });
    }
  }
  
  // Load a sound file
  load(id, url, options = {}) {
    if (!this.enabled) return Promise.resolve();
    
    // Skip if already loaded
    if (this.sounds.has(id)) return Promise.resolve(this.sounds.get(id));
    
    const defaultOptions = {
      volume: 1,
      loop: false,
      autoplay: false
    };
    
    const soundOptions = Object.assign({}, defaultOptions, options);
    
    return new Promise((resolve, reject) => {
      if (this.context) {
        // Use Web Audio API
        fetch(url)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            const sound = {
              id,
              buffer: audioBuffer,
              options: soundOptions,
              source: null,
              gain: null,
              play: () => this.playSound(id)
            };
            
            this.sounds.set(id, sound);
            resolve(sound);
          })
          .catch(error => {
            console.warn(`Failed to load sound ${id}:`, error);
            // Fallback to HTML5 Audio
            this.loadFallback(id, url, soundOptions).then(resolve).catch(reject);
          });
      } else {
        // Use HTML5 Audio as fallback
        this.loadFallback(id, url, soundOptions).then(resolve).catch(reject);
      }
    });
  }
  
  // Load sound using HTML5 Audio (fallback)
  loadFallback(id, url, options) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.src = url;
      audio.volume = options.volume * this.volume;
      audio.loop = options.loop;
      
      if (options.crossOrigin) {
        audio.crossOrigin = options.crossOrigin;
      }
      
      // Set up event handlers
      audio.oncanplaythrough = () => {
        const sound = {
          id,
          audio,
          options,
          play: () => {
            if (this.muted) return Promise.resolve();
            
            // Reset audio to start if it's already played
            if (!audio.paused) {
              audio.currentTime = 0;
            } else {
              audio.volume = options.volume * this.volume;
              audio.play().catch(e => console.warn('Audio play error:', e));
            }
            
            return Promise.resolve();
          }
        };
        
        this.sounds.set(id, sound);
        resolve(sound);
      };
      
      audio.onerror = (error) => {
        console.warn(`Failed to load fallback sound ${id}:`, error);
        reject(error);
      };
      
      // Start loading
      audio.load();
    });
  }
  
  // Play a sound with Web Audio API
  playSound(id) {
    if (!this.enabled || this.muted) return Promise.resolve();
    
    const sound = this.sounds.get(id);
    if (!sound) return Promise.reject(`Sound ${id} not found`);
    
    // For HTML5 Audio fallback
    if (sound.audio) {
      return sound.play();
    }
    
    return new Promise((resolve) => {
      // Create source node
      const source = this.context.createBufferSource();
      source.buffer = sound.buffer;
      source.loop = sound.options.loop;
      
      // Create gain node
      const gainNode = this.context.createGain();
      gainNode.gain.value = sound.options.volume;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Store references
      sound.source = source;
      sound.gain = gainNode;
      
      // Start playback
      source.start(0);
      
      // Cleanup when done
      source.onended = () => {
        sound.source = null;
        sound.gain = null;
        resolve();
      };
    });
  }
  
  // Play a sound by ID
  play(id, options = {}) {
    if (!this.enabled || this.muted) return Promise.resolve();
    
    const sound = this.sounds.get(id);
    
    if (sound) {
      return sound.play();
    } else {
      // Check if the sound is still loading
      console.warn(`Sound ${id} not loaded yet`);
      return Promise.resolve();
    }
  }
  
  // Set global volume
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    if (this.masterGain) {
      // Smooth transition
      this.masterGain.gain.linearRampToValueAtTime(
        this.volume,
        this.context.currentTime + 0.1
      );
    } else {
      // Update all HTML5 Audio elements
      this.sounds.forEach(sound => {
        if (sound.audio) {
          sound.audio.volume = sound.options.volume * this.volume;
        }
      });
    }
    
    return this;
  }
  
  // Mute all sounds
  mute() {
    this.muted = true;
    
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        0,
        this.context.currentTime + 0.1
      );
    } else {
      this.sounds.forEach(sound => {
        if (sound.audio) {
          sound.audio.volume = 0;
        }
      });
    }
    
    return this;
  }
  
  // Unmute all sounds
  unmute() {
    this.muted = false;
    
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.volume,
        this.context.currentTime + 0.1
      );
    } else {
      this.sounds.forEach(sound => {
        if (sound.audio) {
          sound.audio.volume = sound.options.volume * this.volume;
        }
      });
    }
    
    return this;
  }
  
  // Toggle mute state
  toggleMute() {
    return this.muted ? this.unmute() : this.mute();
  }
}

// Create global audio manager instance
window.audioManager = new AudioManager();

// Add hover and click sounds to interactive elements
document.addEventListener('DOMContentLoaded', () => {
  if (!window.audioManager.enabled) return;
  
  // Add click sounds
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('[role="button"]') ||
        target.closest('.clickable')) {
      window.audioManager.play('click');
    }
  });
  
  // Add hover sounds (debounced)
  let hoverTimeout;
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    
    if (target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('[role="button"]') ||
        target.closest('.clickable')) {
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        window.audioManager.play('hover');
      }, 50); // debounce time
    }
  });
});
