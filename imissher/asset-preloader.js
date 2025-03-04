/**
 * Asset Preloader
 * Efficiently preloads and caches assets to ensure smooth animations
 */
class AssetPreloader {
  constructor() {
    this.assets = {
      images: new Map(),
      fonts: new Map(),
      audio: new Map()
    };
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.errorAssets = 0;
    this.listeners = {
      progress: [],
      complete: [],
      error: []
    };
    this.isLoading = false;
    this.isComplete = false;
  }
  
  // Add a single image to be preloaded
  addImage(id, src) {
    if (!this.assets.images.has(id)) {
      this.assets.images.set(id, { src, status: 'pending' });
      this.totalAssets++;
    }
    return this;
  }
  
  // Add multiple images at once
  addImages(imagesObj) {
    for (const [id, src] of Object.entries(imagesObj)) {
      this.addImage(id, src);
    }
    return this;
  }
  
  // Add a font to be preloaded
  addFont(fontFamily, urls, options = {}) {
    if (!this.assets.fonts.has(fontFamily)) {
      this.assets.fonts.set(fontFamily, { urls, options, status: 'pending' });
      this.totalAssets++;
    }
    return this;
  }
  
  // Add audio file to be preloaded
  addAudio(id, src) {
    if (!this.assets.audio.has(id)) {
      this.assets.audio.set(id, { src, status: 'pending' });
      this.totalAssets++;
    }
    return this;
  }
  
  // Start preloading all assets
  preload() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.isComplete = false;
    
    // Create loading visual feedback if requested
    this._createLoadingUI();
    
    // Preload images
    this._preloadImages();
    
    // Preload fonts
    this._preloadFonts();
    
    // Preload audio
    this._preloadAudio();
    
    // Handle case where there are no assets to load
    if (this.totalAssets === 0) {
      this._onComplete();
    }
    
    return this;
  }
  
  // Create loading UI
  _createLoadingUI() {
    // Create a loading overlay
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.style.position = 'fixed';
    this.loadingOverlay.style.top = '0';
    this.loadingOverlay.style.left = '0';
    this.loadingOverlay.style.width = '100%';
    this.loadingOverlay.style.height = '100%';
    this.loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    this.loadingOverlay.style.display = 'flex';
    this.loadingOverlay.style.justifyContent = 'center';
    this.loadingOverlay.style.alignItems = 'center';
    this.loadingOverlay.style.flexDirection = 'column';
    this.loadingOverlay.style.zIndex = '9999';
    
    // Progress indicator
    this.progressBar = document.createElement('div');
    this.progressBar.style.width = '200px';
    this.progressBar.style.height = '4px';
    this.progressBar.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    this.progressBar.style.borderRadius = '2px';
    this.progressBar.style.overflow = 'hidden';
    this.progressBar.style.position = 'relative';
    this.progressBar.style.marginTop = '20px';
    
    // Progress fill
    this.progressFill = document.createElement('div');
    this.progressFill.style.position = 'absolute';
    this.progressFill.style.top = '0';
    this.progressFill.style.left = '0';
    this.progressFill.style.width = '0%';
    this.progressFill.style.height = '100%';
    this.progressFill.style.backgroundColor = '#fe75fe';
    this.progressFill.style.borderRadius = '2px';
    this.progressFill.style.transition = 'width 0.3s ease';
    
    // Loading text
    this.loadingText = document.createElement('div');
    this.loadingText.style.color = 'white';
    this.loadingText.style.fontFamily = 'Arial, sans-serif';
    this.loadingText.style.fontSize = '14px';
    this.loadingText.style.marginTop = '10px';
    this.loadingText.textContent = 'Loading assets...';
    
    // Heart animation
    this.heartContainer = document.createElement('div');
    this.heartContainer.style.fontSize = '40px';
    this.heartContainer.style.opacity = '0.9';
    this.heartContainer.style.animation = 'pulse 1.5s infinite';
    this.heartContainer.innerHTML = '❤️';
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `;
    
    // Assemble the loader UI
    this.progressBar.appendChild(this.progressFill);
    this.loadingOverlay.appendChild(this.heartContainer);
    this.loadingOverlay.appendChild(this.progressBar);
    this.loadingOverlay.appendChild(this.loadingText);
    document.head.appendChild(style);
    document.body.appendChild(this.loadingOverlay);
  }
  
  // Update the loading progress UI
  _updateProgress() {
    if (!this.progressFill) return;
    
    const percentage = this.totalAssets > 0 
      ? Math.round((this.loadedAssets / this.totalAssets) * 100) 
      : 100;
    
    this.progressFill.style.width = `${percentage}%`;
    this.loadingText.textContent = `Loading assets... ${percentage}%`;
    
    // Fire progress event
    this._trigger('progress', {
      loaded: this.loadedAssets,
      total: this.totalAssets,
      percentage: percentage
    });
  }
  
  // Hide and remove the loading UI with animation
  _hideLoadingUI() {
    if (!this.loadingOverlay) return;
    
    // Change the text
    this.loadingText.textContent = 'Ready!';
    
    // Add a check mark
    this.heartContainer.innerHTML = '✨';
    
    // Fade out after a short delay
    setTimeout(() => {
      this.loadingOverlay.style.transition = 'opacity 0.7s ease';
      this.loadingOverlay.style.opacity = '0';
      
      // Remove from DOM after fadeout
      setTimeout(() => {
        if (this.loadingOverlay && this.loadingOverlay.parentNode) {
          this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
          this.loadingOverlay = null;
        }
      }, 700);
    }, 500);
  }
  
  // Preload images
  _preloadImages() {
    if (this.assets.images.size === 0) return;
    
    this.assets.images.forEach((asset, id) => {
      const img = new Image();
      
      img.onload = () => {
        asset.status = 'loaded';
        asset.element = img;
        this.loadedAssets++;
        this._updateProgress();
        this._checkCompletion();
      };
      
      img.onerror = (error) => {
        asset.status = 'error';
        asset.error = error;
        this.errorAssets++;
        this.loadedAssets++;
        this._updateProgress();
        this._checkCompletion();
        this._trigger('error', { id, error, type: 'image' });
      };
      
      img.src = asset.src;
    });
  }
  
  // Preload fonts using Web Font Loader
  _preloadFonts() {
    if (this.assets.fonts.size === 0) return;
    
    // Check if Web Font Loader is already loaded
    if (typeof WebFont === 'undefined') {
      // Load Web Font Loader
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      script.async = true;
      
      script.onload = () => this._initWebFontLoader();
      
      script.onerror = (error) => {
        this.assets.fonts.forEach((asset) => {
          asset.status = 'error';
          asset.error = 'Failed to load WebFont loader';
          this.errorAssets++;
          this.loadedAssets++;
        });
        
        this._updateProgress();
        this._checkCompletion();
        this._trigger('error', { error, type: 'webfont' });
      };
      
      document.head.appendChild(script);
    } else {
      this._initWebFontLoader();
    }
  }
  
  // Initialize WebFont with our font configuration
  _initWebFontLoader() {
    // Convert our fonts map to WebFont config format
    const webFontConfig = { 
      custom: { families: [], urls: [] },
      google: { families: [] },
      active: () => {
        // Mark all fonts as loaded
        this.assets.fonts.forEach((asset) => {
          asset.status = 'loaded';
          this.loadedAssets++;
        });
        
        this._updateProgress();
        this._checkCompletion();
      },
      inactive: () => {
        // Mark all fonts as failed
        this.assets.fonts.forEach((asset) => {
          if (asset.status === 'pending') {
            asset.status = 'error';
            asset.error = 'Font failed to load';
            this.errorAssets++;
            this.loadedAssets++;
          }
        });
        
        this._updateProgress();
        this._checkCompletion();
        this._trigger('error', { error: 'Some fonts failed to load', type: 'font' });
      },
      fontactive: (familyName) => {
        // Mark specific font as loaded
        const asset = this.assets.fonts.get(familyName);
        if (asset && asset.status === 'pending') {
          asset.status = 'loaded';
        }
      },
      fontinactive: (familyName) => {
        // Mark specific font as failed
        const asset = this.assets.fonts.get(familyName);
        if (asset && asset.status === 'pending') {
          asset.status = 'error';
          asset.error = 'Font failed to load';
          this._trigger('error', { id: familyName, error: 'Font failed to load', type: 'font' });
        }
      }
    };
    
    // Sort fonts into appropriate categories
    this.assets.fonts.forEach((asset, familyName) => {
      // Check if it's a Google font
      if (asset.options.google) {
        let fontString = familyName;
        
        // Add weights if specified
        if (asset.options.weights) {
          fontString += `:${asset.options.weights.join(',')}`;
        }
        
        webFontConfig.google.families.push(fontString);
      } else {
        // Custom font
        webFontConfig.custom.families.push(familyName);
        if (asset.urls) {
          asset.urls.forEach(url => {
            if (!webFontConfig.custom.urls.includes(url)) {
              webFontConfig.custom.urls.push(url);
            }
          });
        }
      }
    });
    
    // Skip if no fonts to load
    if (webFontConfig.custom.families.length === 0 && 
        webFontConfig.google.families.length === 0) {
      return;
    }
    
    // Load the fonts
    WebFont.load(webFontConfig);
  }
  
  // Preload audio files
  _preloadAudio() {
    if (this.assets.audio.size === 0) return;
    
    this.assets.audio.forEach((asset, id) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        asset.status = 'loaded';
        asset.element = audio;
        this.loadedAssets++;
        this._updateProgress();
        this._checkCompletion();
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        asset.status = 'error';
        asset.error = error;
        this.errorAssets++;
        this.loadedAssets++;
        this._updateProgress();
        this._checkCompletion();
        this._trigger('error', { id, error, type: 'audio' });
      });
      
      audio.src = asset.src;
      audio.load();
    });
  }
  
  // Check if all assets are loaded
  _checkCompletion() {
    if (this.loadedAssets >= this.totalAssets && !this.isComplete) {
      this._onComplete();
    }
  }
  
  // Handle completion
  _onComplete() {
    this.isLoading = false;
    this.isComplete = true;
    
    // Hide the loading UI
    this._hideLoadingUI();
    
    // Trigger the complete event
    this._trigger('complete', {
      loaded: this.loadedAssets,
      errors: this.errorAssets,
      total: this.totalAssets
    });
  }
  
  // Event handling
  _trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    return this;
  }
  
  // Remove event listener
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
    return this;
  }
  
  // Get a loaded image
  getImage(id) {
    const asset = this.assets.images.get(id);
    if (asset && asset.status === 'loaded') {
      return asset.element;
    }
    return null;
  }
  
  // Get a loaded audio element
  getAudio(id) {
    const asset = this.assets.audio.get(id);
    if (asset && asset.status === 'loaded') {
      return asset.element;
    }
    return null;
  }
  
  // Check if an asset is loaded
  isLoaded(id) {
    // Check in each asset type
    for (const type of Object.keys(this.assets)) {
      const asset = this.assets[type].get(id);
      if (asset) {
        return asset.status === 'loaded';
      }
    }
    return false;
  }
}

// Create global preloader instance
window.preloader = new AssetPreloader();

// Auto-detect and preload all images in the DOM
document.addEventListener('DOMContentLoaded', () => {
  if (!window.PERFORMANCE_CONFIG || window.PERFORMANCE_CONFIG.animations.preloadAssets !== false) {
    // Find all image elements
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        window.preloader.addImage(`img_${img.src.split('/').pop()}`, img.src);
      }
    });
    
    // Find all CSS background images (more complex, basic implementation)
    const elementsWithBackground = document.querySelectorAll('[style*="background-image"]');
    elementsWithBackground.forEach(el => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"()]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          window.preloader.addImage(`bg_${urlMatch[1].split('/').pop()}`, urlMatch[1]);
        }
      }
    });
    
    // Add custom Autography font
    window.preloader.addFont('Autography', ['./The-Flower/Autography.otf']);
    
    // Start preloading
    window.preloader.preload();
  }
});
