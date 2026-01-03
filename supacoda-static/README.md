# Supacoda Static Website

A minimalist portfolio website with particle animation background and bilingual support (EN/DE).

## Features

- 🎨 Light/Dark theme toggle with localStorage persistence
- 🌐 Client-side localization (English/German)
- ✨ Interactive particle canvas animation
- 📱 Responsive design
- 🖼️ Image lightbox for project galleries

## Project Structure

```
supacoda-static/
├── index.html          # Home page
├── about.html          # About page
├── work.html           # Portfolio page
├── contact.html        # Contact page
├── impressum.html      # Legal notice
├── css/
│   └── site.css        # All styles
├── js/
│   ├── site.js         # Particle animation & theme toggle
│   └── i18n.js         # Client-side localization
├── locales/
│   ├── en.json         # English translations
│   └── de.json         # German translations
└── images/
    └── ...             # Project images
```

## Deployment

This is a static site - just upload all files to any web hosting via FTP.

### Local Development

Serve with any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using VS Code Live Server extension
```

Then open http://localhost:8000

## Technology

- Vanilla JavaScript (no frameworks)
- CSS Custom Properties for theming
- Canvas API for particle animation
- Fetch API for loading translations
