# Valentine's Website - Safari and Chrome Compatible

This is a Valentine's Day themed website with animations, created with compatibility for both Chrome and Safari browsers.

## Deployment Instructions for Netlify

### Option 1: Deploy via Netlify Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop the entire project folder onto the Netlify Drop area
3. Netlify will automatically deploy your site and provide a URL

### Option 2: Deploy via Git Repository

1. Upload your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to [Netlify](https://app.netlify.com/)
3. Click "New site from Git"
4. Choose your Git provider and repository
5. Configure build settings:
   - Build command: Leave empty
   - Publish directory: "." (root directory)
6. Click "Deploy site"

## Safari Compatibility Notes

This project includes several fixes to ensure compatibility with Safari:

1. Added requestAnimationFrame polyfill
2. Added Safari-specific CSS fixes
3. Added WebFont loading optimization for Safari
4. Added hardware acceleration for animations in Safari

## Files Added for Safari Compatibility

- `safari-compatibility.css` - Main CSS fixes for Safari
- `raf-polyfill.js` - requestAnimationFrame polyfill
- `The-Flower/safari-fixes.css` - Additional fixes for The-Flower page
- `The-Flower/safari-detect.js` - Script to detect Safari and load fixes

## Manual Integration Steps

After deploying, you should manually add the following script tag to The-Flower/index.html, right before the animation-controller.js script:

```html
<script src="./safari-detect.js"></script>
```

## Testing

After deployment, test your website in both Chrome and Safari to ensure all animations work correctly.
