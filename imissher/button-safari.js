/**
 * Safari-specific button animation handler 
 * This is only loaded when Safari is detected
 */
(function() {
  // Only run this code in Safari
  if (!document.body.classList.contains('safari-browser')) {
    return;
  }

  console.log('Loading Safari-specific button animations');

  // Function to ensure bottom-right bubbles are visible
  function ensureBottomRightBubbles() {
    $('.button--bubble__effect-container .circle.bottom-right').each(function() {
      // Force visibility and positioning for bottom-right bubbles
      $(this).css({
        'opacity': 1,
        'visibility': 'visible',
        'display': 'block',
        'transform': 'translate3d(0, 0, 0) scale(1)',
        '-webkit-transform': 'translate3d(0, 0, 0) scale(1)',
        'will-change': 'transform, opacity',
        'position': 'absolute'
      });
    });
  }

  // Function to adjust the SVG filter for Safari
  function adjustSafariFilter() {
    // Adjust the SVG filter settings for Safari
    $('.goo-filter').each(function() {
      var filter = $(this);
      // Safari needs special filter adjustments
      filter.find('feGaussianBlur').attr('stdDeviation', '9 9');
      filter.find('feColorMatrix').attr('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -7');
    });
    
    // Add hardware acceleration to all SVG elements
    $('svg, .goo').css({
      '-webkit-transform': 'translateZ(0)',
      'transform': 'translateZ(0)',
      'will-change': 'transform'
    });
  }

  // Run initially
  ensureBottomRightBubbles();
  adjustSafariFilter();

  // Run again after a short delay to make sure it's applied
  setTimeout(ensureBottomRightBubbles, 500);
  
  // Completely override button animation for Safari
  $('.button--bubble').each(function() {
    var $circlesTopLeft = $(this).parent().find('.circle.top-left');
    var $circlesBottomRight = $(this).parent().find('.circle.bottom-right');

    // Remove any existing animations/timeouts
    if (window.safariButtonTL) {
      window.safariButtonTL.kill();
    }
    
    // Clear any other timeouts
    clearTimeout(window.safariButtonTimeout);
    
    // Reset all circles to initial state
    $circlesTopLeft.add($circlesBottomRight).css({
      'transform': 'translate3d(0, 0, 0)',
      '-webkit-transform': 'translate3d(0, 0, 0)',
      'opacity': 1,
      'visibility': 'visible',
      'will-change': 'transform, opacity'
    });

    // Create new timelines
    var tl = new TimelineLite();
    var tl2 = new TimelineLite();
    var btTl = new TimelineLite({ paused: true });

    // Top-left animation with Safari-specific adjustments
    tl.to($circlesTopLeft, 1.2, { 
      x: -25, 
      y: -25, 
      scaleY: 2, 
      ease: SlowMo.ease.config(0.1, 0.7, false),
      force3D: true  // Force 3D transforms for Safari
    });
    tl.to($circlesTopLeft.eq(0), 0.1, { scale: 0.2, x: '+=6', y: '-=2', force3D: true });
    tl.to($circlesTopLeft.eq(1), 0.1, { scaleX: 1, scaleY: 0.8, x: '-=10', y: '-=7', force3D: true }, '-=0.1');
    tl.to($circlesTopLeft.eq(2), 0.1, { scale: 0.2, x: '-=15', y: '+=6', force3D: true }, '-=0.1');
    tl.to($circlesTopLeft.eq(0), 1, { scale: 0, x: '-=5', y: '-=15', opacity: 0, force3D: true });
    tl.to($circlesTopLeft.eq(1), 1, { scaleX: 0.4, scaleY: 0.4, x: '-=10', y: '-=10', opacity: 0, force3D: true }, '-=1');
    tl.to($circlesTopLeft.eq(2), 1, { scale: 0, x: '-=15', y: '+=5', opacity: 0, force3D: true }, '-=1');

    var tlBt1 = new TimelineLite();
    var tlBt2 = new TimelineLite();
    
    tlBt1.set($circlesTopLeft, { x: 0, y: 0, rotation: -45, force3D: true });
    tlBt1.add(tl);

    // Bottom-right animation with enhanced Safari-specific fixes
    // More explicit animation for Safari to fix bottom-right corner bubble issues
    tl2.set($circlesBottomRight, { 
      x: 0, 
      y: 0, 
      force3D: true,
      opacity: 1,
      scale: 1.2,  // Start slightly larger
      visibility: 'visible'
    });
    
    // Make bubbles more visible with larger movement
    tl2.to($circlesBottomRight, 1.1, { 
      x: 35,  // Larger movement
      y: 35,  // Larger movement
      ease: SlowMo.ease.config(0.1, 0.7, false),
      force3D: true,
      opacity: 1,
      scale: 1.4  // Larger scale for better visibility
    });
    
    // More dramatic animation for bottom-right bubbles to ensure visibility
    tl2.to($circlesBottomRight.eq(0), 0.1, { scale: 0.6, x: '-=6', y: '+=3', force3D: true, opacity: 1 });
    tl2.to($circlesBottomRight.eq(1), 0.1, { scale: 1.2, x: '+=7', y: '+=3', force3D: true, opacity: 1 }, '-=0.1');
    tl2.to($circlesBottomRight.eq(2), 0.1, { scale: 0.6, x: '+=15', y: '-=6', force3D: true, opacity: 1 }, '-=0.1');
    
    // Slower fade-out for more visibility
    tl2.to($circlesBottomRight.eq(0), 1.5, { scale: 0, x: '+=15', y: '+=25', opacity: 0, force3D: true });
    tl2.to($circlesBottomRight.eq(1), 1.5, { scale: 0.4, x: '+=17', y: '+=17', opacity: 0, force3D: true }, '-=1.4');
    tl2.to($circlesBottomRight.eq(2), 1.5, { scale: 0, x: '+=25', y: '-=15', opacity: 0, force3D: true }, '-=1.4');
    
    tlBt2.set($circlesBottomRight, { x: 0, y: 0, rotation: 45, force3D: true, opacity: 1 });
    tlBt2.add(tl2);

    btTl.add(tlBt1);
    btTl.to($(this).parent().find('.button.effect-button'), 0.8, { 
      scaleY: 1.1, 
      force3D: true
    }, 0.1);
    btTl.add(tlBt2, 0.2);
    btTl.to($(this).parent().find('.button.effect-button'), 1.8, { 
      scale: 1, 
      ease: Elastic.easeOut.config(1.2, 0.4),
      force3D: true
    }, 1.2);

    // Safari-specific timing
    btTl.timeScale(1.5);
    
    // Store timeline for potential cleanup
    window.safariButtonTL = btTl;

    // Enhanced event handling for Safari
    var buttonElement = $(this);
    
    // Remove any existing event handlers
    buttonElement.off('mouseover mouseenter');
    
    // Use mouseenter for better Safari compatibility
    buttonElement.on('mouseenter', function() {
      // Reset bottom-right bubbles before animation
      $circlesBottomRight.css({
        'opacity': 1,
        'visibility': 'visible',
        'transform': 'translate3d(0, 0, 0) rotate(45deg) scale(1.2)',
        '-webkit-transform': 'translate3d(0, 0, 0) rotate(45deg) scale(1.2)',
        'will-change': 'transform, opacity'
      });
      
      // Ensure filter is correctly applied
      adjustSafariFilter();
      
      // Start the animation
      btTl.restart();
      
      // Ensure bottom-right bubbles are visible during animation
      ensureBottomRightBubbles();
      
      // Set timeout to rerun bubble visibility check during animation
      window.safariButtonTimeout = setTimeout(ensureBottomRightBubbles, 300);
    });
  });
  
  // Additional fix for click handler - ensure it works reliably in Safari
  $('.button--bubble').on('click', function(e) {
    e.preventDefault();
    const flowerPath = './The-Flower/index.html';
    window.open(flowerPath, '_blank');
  });
})();
