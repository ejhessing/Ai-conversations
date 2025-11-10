# Assets Directory

This directory should contain the following image assets for the AI Conversation Coach app:

## Required Assets

### 1. **icon.png** (App Icon)
- Size: 1024x1024px
- Format: PNG
- Description: Main app icon displayed on device home screen
- Suggested: Microphone or speech bubble icon in primary brand color (#6366f1)

### 2. **adaptive-icon.png** (Android Adaptive Icon)
- Size: 1024x1024px
- Format: PNG
- Description: Foreground image for Android adaptive icon
- Note: Should work well with the background color #6366f1 (specified in app.json)

### 3. **splash.png** (Splash Screen)
- Size: 2048x2048px (or larger for better quality)
- Format: PNG
- Description: Image displayed while app is loading
- Background Color: #6366f1 (specified in app.json)
- Suggested: App logo or branding centered on colored background

### 4. **favicon.png** (Web Favicon)
- Size: 48x48px or 64x64px
- Format: PNG
- Description: Icon displayed in browser tab when running as web app

## Creating Your Assets

### Quick Start with Free Tools:

1. **Figma** (https://figma.com)
   - Free design tool
   - Great for creating icons and graphics
   - Export to PNG directly

2. **Canva** (https://canva.com)
   - Free with templates
   - Easy icon creation
   - Export in required sizes

3. **Icon8** (https://icons8.com)
   - Free icons available
   - Can customize colors
   - Multiple sizes

### Design Guidelines:

- **Colors**: Use the app's primary color (#6366f1 - Indigo)
- **Style**: Modern, clean, professional
- **Theme**: Communication, speech, coaching, microphone, conversation
- **Typography**: If including text, use clean sans-serif fonts

### Simple Placeholder Generation:

For quick testing, you can generate solid color placeholders:

```bash
# Using ImageMagick (if installed)
convert -size 1024x1024 xc:#6366f1 icon.png
convert -size 1024x1024 xc:#6366f1 adaptive-icon.png
convert -size 2048x2048 xc:#6366f1 splash.png
convert -size 64x64 xc:#6366f1 favicon.png
```

Or use online generators:
- https://www.favicon-generator.org/
- https://www.figma.com/community/file/1154362692843228558
- https://appicon.co/

## Testing Your Assets

After adding your assets, rebuild the app:

```bash
# Clear cache and rebuild
expo start -c

# Test on iOS
expo start --ios

# Test on Android
expo start --android
```

## Notes

- Keep original high-resolution files (PSD, AI, Figma, etc.)
- Assets should be optimized for size (use tools like TinyPNG)
- Ensure icons look good on both light and dark backgrounds
- Test splash screen on various device sizes
- Consider accessibility (sufficient contrast, clear visuals)
