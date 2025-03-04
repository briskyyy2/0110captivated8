// Fast Forward Indicator
document.addEventListener("DOMContentLoaded", function() {
  // Store the position of the fast forward button
  let buttonRect = null;
  
  // Create the fast forward indicator element
  const ffIndicator = document.createElement('div');
  ffIndicator.id = 'fast-forward-indicator';
  ffIndicator.style.position = 'fixed';
  ffIndicator.style.bottom = '20px';
  ffIndicator.style.right = '20px';
  ffIndicator.style.backgroundColor = 'black';
  ffIndicator.style.color = 'white';
  ffIndicator.style.padding = '10px 15px';
  ffIndicator.style.borderRadius = '25px';
  ffIndicator.style.zIndex = '10000';
  ffIndicator.style.display = 'none';
  ffIndicator.style.fontFamily = 'Arial, sans-serif';
  ffIndicator.style.fontSize = '16px';
  ffIndicator.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  ffIndicator.style.pointerEvents = 'none';
  ffIndicator.innerHTML = '⏩ Fast Forwarding...';
  document.body.appendChild(ffIndicator);

  // Create the blinking animation
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes ffBlink {
      0% { opacity: 1; }
      50% { opacity: 0.3; }
      100% { opacity: 1; }
    }
    #fast-forward-indicator {
      animation: ffBlink 1s infinite;
    }
  `;
  document.head.appendChild(style);

  // Function to show the fast forward indicator
  window.showFastForwardIndicator = function() {
    // Get the position of the fast forward button before showing the indicator
    const ffButton = document.getElementById('fast-forward-button');
    if (ffButton) {
      buttonRect = ffButton.getBoundingClientRect();
      
      // Position the indicator exactly where the button was
      ffIndicator.style.bottom = (window.innerHeight - buttonRect.bottom) + 'px';
      ffIndicator.style.right = (window.innerWidth - buttonRect.right) + 'px';
      ffIndicator.style.width = buttonRect.width + 'px';
      ffIndicator.style.height = buttonRect.height + 'px';
      ffIndicator.style.display = 'flex';
      ffIndicator.style.alignItems = 'center';
      ffIndicator.style.justifyContent = 'center';
      
      console.log('Fast forward indicator positioned at:', {
        bottom: (window.innerHeight - buttonRect.bottom) + 'px',
        right: (window.innerWidth - buttonRect.right) + 'px',
        width: buttonRect.width + 'px',
        height: buttonRect.height + 'px'
      });
    }
    
    ffIndicator.style.display = 'flex';
    console.log('Fast forward indicator should be visible now');
  };

  // Function to hide the fast forward indicator
  window.hideFastForwardIndicator = function() {
    ffIndicator.style.display = 'none';
    console.log('Fast forward indicator hidden');
  };
});
