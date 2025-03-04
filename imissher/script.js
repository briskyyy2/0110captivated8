document.addEventListener("DOMContentLoaded", function () {
  const heartCheckbox = document.getElementById("toggle-heart");
  const typewriterContainer = document.getElementById("typewriter-container");
  const newButtonContainer = document.getElementById("new-button-container");
  const body = document.body;
  const heartLabel = document.querySelector("[for='toggle-heart']");
  const ffContainer = document.getElementById('fast-forward-container');
  let isAnimating = false;
  let currentTimeouts = []; // Array to store timeout IDs
  let hasButtonAppeared = false;
  let fastForwardActive = false;
  let fastForwardUsed = false; // Track if fast forward has been used
  let isFirstAnimation = true; // Track if this is the first animation cycle
  let hasAddedHighlight = false;
  let typingInterval = null;
  let anywayElement = null;
  let giftElement = null;
  let hopeElement = null;
  let timeoutIds = [];

  // Play subtle background ambience if audio manager is available
  if (window.audioManager) {
    // Load custom sounds for enhanced experience
    window.audioManager.load('typewriter', 'https://assets.codepen.io/385863/key-press.mp3', { volume: 0.3 });
    window.audioManager.load('heartbeat', 'https://assets.codepen.io/385863/heart-beat.mp3', { volume: 0.5 });
    window.audioManager.load('transition', 'https://assets.codepen.io/385863/whoosh.mp3', { volume: 0.4 });
    window.audioManager.load('highlight', 'https://assets.codepen.io/385863/highlight.mp3', { volume: 0.4 });
  }

  // Initialize fast-forward-container as hidden
  ffContainer.classList.add('hidden');
  ffContainer.classList.add('slide-from-left');
  
  // Add transition end listener for the fast-forward-container
  ffContainer.addEventListener('transitionend', function(e) {
    if (e.propertyName === 'opacity' && ffContainer.classList.contains('hidden')) {
      ffContainer.style.display = 'none';
    }
  });

  // Function to clear all timeouts
  function clearAllTimeouts() {
    currentTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    currentTimeouts = [];
  }

  // Function to add timeout and store its ID
  function addTimeout(callback, delay) {
    const timeoutId = setTimeout(callback, delay);
    currentTimeouts.push(timeoutId);
    return timeoutId;
  }

  // Add glow class initially
  heartLabel.classList.add("glow");

  // Typewriting Effect Code
  const textArray = [
    { text: "Hi there!", pause: 1900, typingSpeed: 50, deletingSpeed: 50 },
    { text: "it's been a while :)", pause: 1200, typingSpeed: 40, deletingSpeed: 40 },
    { text: "sooo..", pause: 400, typingSpeed: 70, deletingSpeed: 70 },
    { text: "I made this website to get back in touch with you!", pause: 2000, typingSpeed: 60, deletingSpeed: 13 },
    { text: "everything you'll see here is actually made from scratch", pause: 3100, typingSpeed: 60, deletingSpeed: 5 }
  ];

  const typewriterElement = document.getElementById("typewriter");
  const secondLineElement = document.getElementById("secondLine");
  let index = 0;

  const NORMAL_SPEED = {
    typing: {
      hi: 50,
      been: 40,
      soo: 70,
      made: 60,
      everything: 60,
      hope: 60
    },
    pause: {
      afterHi: 1000,
      afterBeen: 800,
      afterSoo: 500,
      afterMade: 800,
      afterEverything: 1000
    }
  };

  const FAST_SPEED = {
    typing: {
      hi: 10,
      been: 10,
      soo: 10,
      made: 10,
      everything: 10,
      hope: 10
    },
    pause: {
      afterHi: 100,
      afterBeen: 100,
      afterSoo: 100,
      afterMade: 100,
      afterEverything: 100
    }
  };

  function getSpeed(type, key) {
    const speeds = fastForwardActive ? FAST_SPEED : NORMAL_SPEED;
    return speeds[type][key];
  }

  function getTimeoutDuration(normalDuration) {
    return fastForwardActive ? normalDuration / 5 : normalDuration;
  }

  function getAnimationSpeed(normalSpeed) {
    return fastForwardActive ? normalSpeed / 5 : normalSpeed;
  }

  // Function to reset the typewriter effect
  function resetTypewriter() {
    timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutIds = [];

    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }

    typewriterElement.innerHTML = "";
    secondLineElement.innerHTML = "";
    typewriterElement.classList.remove("fadeOut");
    secondLineElement.classList.remove("fadeOut");
    index = 0;
    hasAddedHighlight = false;

    if (anywayElement) {
      anywayElement.remove();
      anywayElement = null;
    }

    if (giftElement) {
      giftElement.remove();
      giftElement = null;
    }

    if (hopeElement) {
      hopeElement.remove();
      hopeElement = null;
    }
  }

  function typeWriterEffect(textObj) {
    let charIndex = 0;
    typingInterval = setInterval(() => {
      typewriterElement.innerHTML = textObj.text.substring(0, charIndex);
      charIndex++;

      if (charIndex > textObj.text.length) {
        clearInterval(typingInterval);

        if (textObj.text === "everything you'll see here is actually made from scratch" && !hasAddedHighlight) {
          const timeoutId = setTimeout(() => {
            typewriterElement.innerHTML += " <span class='highlight'></span>"; // Add a space before the highlight
            typeWriterEffectForWell();
          }, getTimeoutDuration(1100));
          timeoutIds.push(timeoutId);
        } else {
          const timeoutId = setTimeout(() => deleteText(textObj), getTimeoutDuration(textObj.pause));
          timeoutIds.push(timeoutId);
        }
      }
    }, getAnimationSpeed(textObj.typingSpeed));
  }

  function typeWriterEffectForWell() {
    const wellText = "well..";
    let charIndex = 0;
    typingInterval = setInterval(() => {
      const highlightElement = typewriterElement.querySelector(".highlight");
      highlightElement.innerHTML = wellText.substring(0, charIndex);
      charIndex++;

      if (charIndex > wellText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          typeWriterEffectForHighlight();
        }, getTimeoutDuration(600));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(60));
  }

  function typeWriterEffectForHighlight() {
    const highlightText = " not really :o";
    let charIndex = 0;
    typingInterval = setInterval(() => {
      const highlightElement = typewriterElement.querySelector(".highlight");
      highlightElement.innerHTML += highlightText.substring(charIndex, charIndex + 1);
      charIndex++;

      if (charIndex > highlightText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          typeWriterEffectForSecondLine();
        }, getTimeoutDuration(1500));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(45));
  }

  function typeWriterEffectForSecondLine() {
    const secondLineText = "I'm using Vercel for web hosting, but everything else is pretty much done by me🧏🏻‍♂️";
    let charIndex = 0;
    typingInterval = setInterval(() => {
      secondLineElement.innerHTML = secondLineText.substring(0, charIndex);
      charIndex++;

      if (charIndex > secondLineText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          fadeOutText();
        }, getTimeoutDuration(1700));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(getSpeed('typing', 'been'))); // Slowed down to 60ms
  }

  function typeWriterEffectForAnyway() {
    const anywayText = "anyway..";
    let charIndex = 0;
    typingInterval = setInterval(() => {
      typewriterElement.innerHTML = anywayText.substring(0, charIndex);
      charIndex++;

      if (charIndex > anywayText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          deleteAnywayText();
        }, getTimeoutDuration(800));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(getSpeed('typing', 'soo')));
  }

  function deleteAnywayText() {
    let text = typewriterElement.innerHTML;
    const deleteInterval = setInterval(() => {
      text = text.substring(0, text.length - 1);
      typewriterElement.innerHTML = text;
      
      if (text.length === 0) {
        clearInterval(deleteInterval);
        const timeoutId = setTimeout(() => {
          typeWriterEffectForGift();
        }, getTimeoutDuration(300));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(50));
  }

  function typeWriterEffectForGift() {
    const giftText = "here's a little gift for a suuuper late Valentine's Day!";
    let charIndex = 0;
    typingInterval = setInterval(() => {
      typewriterElement.innerHTML = giftText.substring(0, charIndex);
      charIndex++;

      if (charIndex > giftText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          typeWriterEffectForHope();
        }, getTimeoutDuration(1000)); // Use getTimeoutDuration for consistent fast-forward
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(getSpeed('typing', 'made'))); // Slowed down to 60ms
  }

  function typeWriterEffectForHope() {
    const hopeText = "(hope no other guys have sent you one yet tho 💔)";
    hopeElement = document.createElement("div");
    hopeElement.className = "small-text";
    typewriterContainer.appendChild(hopeElement);
    let charIndex = 0;
    typingInterval = setInterval(() => {
      hopeElement.innerHTML = hopeText.substring(0, charIndex);
      charIndex++;

      if (charIndex > hopeText.length) {
        clearInterval(typingInterval);
        const timeoutId = setTimeout(() => {
          newButtonContainer.style.display = "block";
          hasButtonAppeared = true;
          isFirstAnimation = false; // Mark that the first animation cycle is complete
          hideFFIndicator(); // Hide indicator when everything is done
        }, getTimeoutDuration(fastForwardActive ? 100 : 300));
        timeoutIds.push(timeoutId);
      }
    }, getAnimationSpeed(getSpeed('typing', 'hope'))); // Adjust speed based on fast-forward state
  }

  function fadeOutText() {
    typewriterElement.classList.add("fadeOut");
    secondLineElement.classList.add("fadeOut");

    const timeoutId = setTimeout(() => {
      typewriterElement.classList.remove("fadeOut");
      secondLineElement.classList.remove("fadeOut");
      typewriterElement.innerHTML = "";
      secondLineElement.innerHTML = "";
      const timeoutId2 = setTimeout(() => {
        typeWriterEffectForAnyway();
      }, getTimeoutDuration(500));
      timeoutIds.push(timeoutId2);
    }, getTimeoutDuration(1500));
    timeoutIds.push(timeoutId);
  }

  function deleteText(textObj) {
    let charIndex = textObj.text.length + (hasAddedHighlight ? 18 + 7 : 0);
    typingInterval = setInterval(() => {
      typewriterElement.innerHTML = textObj.text.substring(0, charIndex);
      charIndex--;

      if (charIndex < 0) {
        clearInterval(typingInterval);
        index = (index + 1) % textArray.length;
        secondLineElement.innerHTML = "";

        if (textArray[index].text === "everything you'll see here is actually made from scratch") {
          const timeoutId = setTimeout(() => typeWriterEffect(textArray[index]), getTimeoutDuration(1500)); // Reduced from 2000 to 1500
          timeoutIds.push(timeoutId);
        } else {
          const timeoutId = setTimeout(() => typeWriterEffect(textArray[index]), getTimeoutDuration(500));
          timeoutIds.push(timeoutId);
        }
      }
    }, getAnimationSpeed(textObj.deletingSpeed));
  }

  // Function to hide the fast-forward indicator when animation is complete
  function hideFFIndicator() {
    document.getElementById('arrow-indicator').style.display = 'none';
    // Don't show the fast-forward button again
    fastForwardActive = false;
    // Ensure the fast-forward container fades out
    document.getElementById('fast-forward-container').classList.add('hidden');
  }

  // Function to reset the animation
  function resetAnimation() {
    resetTypewriter();
    typeWriterEffect(textArray[0]);
    // Reset the fastForwardUsed flag to allow the button to appear again
    fastForwardUsed = false;
    // Reset the fast-forward container to its initial state
    ffContainer.classList.add('slide-from-left');
  }

  // Function to manage fast-forward button state
  function manageButtonState(show) {
    const fastForwardButton = document.getElementById('fast-forward-button');
    fastForwardButton.disabled = !show;
    fastForwardButton.style.display = show ? 'block' : 'none';
  }

  // Heart Button Event Listener
  heartCheckbox.addEventListener("change", function () {
    if (fastForwardActive) {
      // Prevent triggering the reset feature during fast forward phase
      heartCheckbox.checked = !heartCheckbox.checked;
      return;
    }
    // If animation is running, prevent the change
    if (isAnimating) {
      // Revert the checkbox state
      heartCheckbox.checked = !heartCheckbox.checked;
      return;
    }

    // Clear any existing timeouts
    clearAllTimeouts();
    
    isAnimating = true;
    const animationDuration = 800;

    if (heartCheckbox.checked) {
      heartLabel.classList.remove("glow");
      
      // Reset fast-forward state when heart is clicked
      fastForwardActive = false;
      
      // Get heart button position
      const heartRect = heartLabel.getBoundingClientRect();
      const centerX = heartRect.left + heartRect.width / 2;
      const centerY = heartRect.top + heartRect.height / 2;

      // Create and position the color transition element
      let colorTransition = document.querySelector('.color-transition');
      if (!colorTransition) {
        colorTransition = document.createElement('div');
        colorTransition.className = 'color-transition';
        document.body.appendChild(colorTransition);
      }

      // Position the transition element at the heart's center
      colorTransition.style.left = centerX + 'px';
      colorTransition.style.top = centerY + 'px';

      // Trigger the animation
      requestAnimationFrame(() => {
        colorTransition.classList.add('expanded');
      });

      // Show fast-forward button only after the first animation cycle is complete
      // and the "Click Here!" button has appeared at least once
      if (!isFirstAnimation && hasButtonAppeared) {
        addTimeout(() => {
          // First set display to block while it's still hidden
          ffContainer.style.display = 'block';
          
          // Then after a tiny delay, trigger both the fade-in and slide-in
          setTimeout(() => {
            ffContainer.classList.remove('hidden');
            // After a short delay, start the sliding animation
            setTimeout(() => {
              ffContainer.style.transition = 'opacity 0.5s ease, visibility 0.5s ease, transform 0.5s ease';
              ffContainer.classList.remove('slide-from-left');
            }, 50);
          }, 10);
        }, animationDuration + 1000); // Show after typewriting has started
      }

      // First make the container visible after the background transition
      addTimeout(() => {
        typewriterContainer.style.display = "block";
      }, animationDuration);

      // Then start the typewriting effect after an additional pause
      addTimeout(() => {
        resetTypewriter(); // Reset before starting new animation
        typeWriterEffect(textArray[index]);
      }, fastForwardActive ? 100 : (animationDuration + 750)); // Much shorter delay in fast-forward mode

      // Allow next animation after current one completes
      addTimeout(() => {
        isAnimating = false;
      }, animationDuration + 100); // A bit longer than animation to ensure completion

    } else {
      // Remove the color transition
      const colorTransition = document.querySelector('.color-transition');
      if (colorTransition) {
        colorTransition.classList.remove('expanded');
      }

      // Reset other elements
      typewriterContainer.style.display = "none";
      newButtonContainer.style.display = "none";
      resetTypewriter();

      heartLabel.classList.add("glow");

      // Allow next animation after current one completes
      addTimeout(() => {
        isAnimating = false;
        manageButtonState(true);
      }, animationDuration);
    }
  });

  document.getElementById('fast-forward-button').addEventListener('click', function() {
    fastForwardActive = true;
    fastForwardUsed = true; // Mark that fast forward has been used
    
    // For disappearance, only fade out (no sliding)
    ffContainer.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    ffContainer.classList.add('hidden');
    
    // Show the arrow animation indicator
    document.getElementById('arrow-indicator').style.display = 'block';
    
    // No need to reset the animation, just speed up the current state
    // We don't call resetAnimation() anymore
  });

  document.getElementById('heart-button').addEventListener('click', function() {
    clearAllTimeouts();
    resetAnimation();
    manageButtonState(true);
  });
});