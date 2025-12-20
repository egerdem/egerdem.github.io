# Website Setup Instructions

## What Was Done

I've successfully set up the IFICL template for your main GitHub Pages site (egerdem.github.io) with your information:

### ✅ Completed:
1. **Backed up** your old index.html to `index.html.backup`
2. **Copied** the IFICL template (assets, CSS, JS)
3. **Customized** with your information:
   - Name: Ege Erdem
   - Affiliation: King's College London
   - Updated About section with your bio
   - Added News section with recent updates
   - Updated Research interests (spatial audio focus)
   - Updated Work Experience (NII, MTG, METU, Mezzo)
   - Updated links (GitHub, Email, LinkedIn)

### 🔧 To Do (Next Steps):

#### 1. Add Your Profile Photo
- Add your photo to: `images/selfish/self.jpg`
- Recommended size: 400x400px or similar square format
- The template will automatically resize it

#### 2. Update Publications Section
The publications section still has placeholder content. You need to:
- Go to line ~312 in `index.html`
- Replace with your publications from your CV:
  - SF-Flow (2025)
  - 3D Perceptual Soundfield Reconstruction (ICASSP 24, TASLP 23)
  - Sound Field Interpolation (I3DA 23)
  - Microphone Array Calibration papers (WASPAA 21, I3DA 21)
  - Earlier papers (ICASSP 19, TAKDER 19)

#### 3. Add Project Pages (Optional)
If you want to showcase specific projects:
- Add project images to `images/projects/`
- Update the projects section in index.html
- Link to sf-flow project page: `href="sf-flow/"`

#### 4. Update Google Analytics (Optional)
- Line ~62 in index.html has Google Analytics code
- Replace `G-ZL4BP5RJ60` with your own GA tracking ID
- Or remove if you don't want analytics

#### 5. Add Your Google Scholar Link
- Line ~166: Replace `YOUR_ID` with your Google Scholar ID
- Example: `https://scholar.google.com/citations?user=YOUR_ACTUAL_ID`

#### 6. Test Locally
```bash
cd /Users/ege/Library/CloudStorage/OneDrive-Personal/_WEB/egerdem.github.io
python3 -m http.server 8000
# Then open: http://localhost:8000
```

#### 7. Update style.css (if needed)
Your old `style.css` is still there but not used by the new template.
The new template uses `assets/css/main.css` for customizations.

## File Structure

```
egerdem.github.io/
├── index.html              # Main page (customized IFICL template)
├── index.html.backup       # Your old page (with merge conflicts)
├── style.css               # Old CSS (not used anymore)
├── sf-flow/               # Your SF-Flow project page (untouched)
├── assets/                # Template CSS/JS
│   ├── css/
│   └── js/
└── images/                # Add your images here
    ├── selfish/
    │   └── self.jpg       # ADD YOUR PHOTO HERE
    └── projects/          # Project images
```

## Quick Edits Guide

### Change Text/Content:
- Open `index.html` in your editor
- Search for sections: "About", "News", "Research", "Work Experience", "Publication"
- Edit the HTML content directly

### Change Colors/Styling:
- Edit `assets/css/main.css`
- Main colors are defined at the top of the file

### Add New Section:
- Copy an existing section structure from index.html
- Modify the content
- Update the navigation menu at the top

## Reference
- Original template: https://github.com/IFICL/IFICL.github.io
- Live example: https://ificl.github.io/

## Support
The template uses:
- Bootstrap 3.x
- jQuery
- Owl Carousel
- Animate.css
- Font Awesome icons (via Ionicons)

All dependencies are included in the `assets/` folder.

