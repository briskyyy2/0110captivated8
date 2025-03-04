// Function to initialize the handwriting animation
function initHandwritingAnimation() {
    console.log('Initializing handwriting animation...');
    
    // Create WebFont loader script dynamically to ensure fonts are loaded
    if (!document.getElementById('webfontloader')) {
        const webFontScript = document.createElement('script');
        webFontScript.id = 'webfontloader';
        webFontScript.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
        webFontScript.async = true;
        
        webFontScript.onload = function() {
            // Configure WebFont to load our custom font
            WebFont.load({
                custom: {
                    families: ['Autography'],
                    urls: ['./handwriting-animation.css']
                },
                // When active, create the font preloader
                active: function() {
                    console.log('WebFont loaded successfully');
                    createFontPreloader();
                },
                inactive: function() {
                    console.log('WebFont failed to load, using fallback');
                    createFontPreloader(); // Still create preloader with fallback
                }
            });
        };
        
        document.head.appendChild(webFontScript);
    } else {
        createFontPreloader();
    }
    
    function createFontPreloader() {
        // Preload the font to prevent FOUT
        const fontPreloader = document.createElement('div');
        fontPreloader.style.fontFamily = 'Autography, cursive, sans-serif';
        fontPreloader.style.visibility = 'hidden';
        fontPreloader.style.position = 'absolute';
        fontPreloader.style.top = '-9999px';
        fontPreloader.textContent = 'for Allena, just because.';
        document.body.appendChild(fontPreloader);
        
        // Create container for the handwriting animation if it doesn't exist
        createHandwritingContainer();
    }
    
    function createHandwritingContainer() {
        let handwritingContainer = document.querySelector('.handwriting-container');
        
        if (!handwritingContainer) {
            console.log('Creating handwriting container');
            handwritingContainer = document.createElement('div');
            handwritingContainer.className = 'handwriting-container';
            
            const textContainer = document.createElement('div');
            textContainer.className = 'text-container';
            
            const textAnimation = document.createElement('div');
            textAnimation.id = 'text-animation';
            textAnimation.style.opacity = '0';
            textAnimation.style.visibility = 'hidden';
            textAnimation.textContent = 'for Allena, just because.'; // Updated text
            
            textContainer.appendChild(textAnimation);
            handwritingContainer.appendChild(textContainer);
            document.body.appendChild(handwritingContainer);
            console.log('Handwriting container created and added to DOM');
        } else {
            console.log('Handwriting container already exists');
        }
    }
}

// Function to start the handwriting animation
function startHandwritingAnimation() {
    console.log('Starting handwriting animation...');
    
    // Get the container
    const handwritingContainer = document.querySelector('.handwriting-container');
    if (!handwritingContainer) {
        console.log('Handwriting container not found, creating it now...');
        initHandwritingAnimation();
        setTimeout(startHandwritingAnimation, 100);
        return;
    }
    
    // Make it visible with opacity 1
    handwritingContainer.style.display = 'block';
    handwritingContainer.style.opacity = '1';
    
    // Get the text element
    const textElement = document.getElementById('text-animation');
    if (!textElement) {
        console.log('Text animation element not found');
        return;
    }
    
    // Get the container and make it visible
    const textContainer = document.querySelector('.text-container');
    textContainer.style.opacity = '1';
    
    // Reset element content
    const text = 'for Allena, just because.'; // Ensure period is included
    textElement.dataset.originalText = text;
    textElement.innerHTML = '';
    
    // Create letter elements
    const letters = text.split('');
    
    // Find the index of "with" to add a delay
    const withIndex = text.indexOf('with');
    
    // Find the index of "just" to add a delay
    const justIndex = text.indexOf('just');
    
    // Calculate total animation duration to know when typing is complete
    let totalTypingDuration = 0;
    
    // Reapply the text as individual spans with staggered animations
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        
        // Handle special characters
        if (letter === ' ') {
            span.innerHTML = '&nbsp;';
            span.classList.add('space');
        } else if (letter === '.') {
            span.textContent = letter;
            span.style.position = 'relative'; // Enable positioning
            span.style.display = 'inline-block'; // Make it a block for positioning
        } else {
            span.textContent = letter;
        }
        
        // Slow down the animation (from 0.1s to 0.15s per letter)
        let delay = 0.15 + index * 0.15;
        
        // If we're at or after the "with" index, add the pause
        if (index >= withIndex && withIndex !== -1) {
            delay += 0.6; // Reduced from 1.0 to 0.6
        }
        
        // If we're at or after the "just" index, add the pause
        if (index >= justIndex && justIndex !== -1) {
            delay += 0.5; // 0.5 second pause before "just because"
        }
        
        // Track the total duration
        if (delay > totalTypingDuration) {
            totalTypingDuration = delay;
        }
        
        span.style.animationDelay = `${delay}s`;
        textElement.appendChild(span);
    });
    
    // Add the flickering effect AFTER typing is complete
    setTimeout(() => {
        textElement.classList.add('complete-typing');
        console.log('Typing complete, starting flickering animation');
        
        // Ensure we use the CSS interval (5s) and don't randomize it
        textElement.style.setProperty('--interval', '5s');
        
        // Set up occasional double flicker pattern
        setUpDoubleFlickers(textElement);
    }, (totalTypingDuration + 0.5) * 1000); // Add 0.5s buffer after last letter
}

// Functions from the example script.js
function randomIn(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Keep these functions but don't use them 
function mixupInterval(el) {
    // Don't randomize - use the fixed 6s interval from CSS
    // const ms = randomIn(2000, 4000);
    // el.style.setProperty('--interval', `${ms}ms`);
}

function setupNeonFlicker(textElement) {
    // Do nothing - we want to use the fixed interval
    // Don't add event listeners that would change the interval
}

// New function to create occasional double-flicker effect
function setUpDoubleFlickers(textElement) {
    // Monitor the animation iterations
    textElement.addEventListener('animationiteration', () => {
        checkForSecondaryFlicker(textElement);
    });
    
    // Also support webkit
    textElement.addEventListener('webkitAnimationIteration', () => {
        checkForSecondaryFlicker(textElement);
    });
}

function checkForSecondaryFlicker(textElement) {
    // Increase chance to 80% (from 70%)
    if (Math.random() < 0.8) {
        setTimeout(() => {
            const flickerType = Math.random();
            
            // Choose between different flicker types based on probability
            if (flickerType < 0.6) {
                // Standard secondary flicker (60% chance when flickering)
                textElement.classList.add('secondary-flicker');
                setTimeout(() => {
                    textElement.classList.remove('secondary-flicker');
                }, 250); // slightly longer duration
            } else {
                // Rapid buzz effect (40% chance when flickering)
                textElement.classList.add('buzz-flicker');
                setTimeout(() => {
                    textElement.classList.remove('buzz-flicker');
                }, 800); // longer duration for the sequence
            }
        }, 2000); // 2 second delay after main flicker
    }
}

// Make functions globally available
window.initHandwritingAnimation = initHandwritingAnimation;
window.startHandwritingAnimation = startHandwritingAnimation;
