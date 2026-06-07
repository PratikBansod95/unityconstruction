# Unity Construction Website

A high-performance, modular, and security-hardened marketing website for Unity Construction — Maharashtra's premier property valuation, structural consulting, and architectural advisory firm.

## 🛠 Refactoring & Industry Standards

The codebase has been refactored from a monolithic 2.4 MB single file into a structured, modular static application that aligns with modern web engineering best practices:

- **Resource Extraction:** Decoded the massive 2.4 MB base64 video stream into a separate, compressed physical binary file (`assets/video/hero.mp4`), reducing the initial page load bundle size from 2.4 MB to a tiny 15 KB HTML frame.
- **Style Separation:** Formatted and structured the inline stylesheet into a clean, hierarchical stylesheet (`css/styles.css`).
- **Modularity:** Isolated interactive canvases and global coordination scripts into scoped ES5/ES6 Javascript modules located in the `js/` directory.

## 📁 Directory Structure

```
unity-construction/
  ├── assets/
  │   └── video/
  │       └── hero.mp4        # Extracted 1.79 MB video asset
  ├── css/
  │   └── styles.css          # Core CSS variables, responsive layouts, and keyframes
  ├── js/
  │   ├── main.js             # Theme toggle persistence, scrolls reveal, form validation
  │   ├── cursor.js           # Touch-screen guarded custom cursor logic
  │   ├── canvas-about.js     # Rotating blueprint building animation
  │   ├── canvas-services.js  # Service orb canvas icons
  ├── index.html              # Clean, SEO-optimized markup entry point
  └── README.md               # Project documentation
```

## ⚡ Performance & Functional Optimizations

1. **High-DPI rendering (Retina/4K):** Canvas animations now dynamically query `window.devicePixelRatio` and scale the drawing contexts accordingly. This eliminates rendering blurriness, making 3D lines look incredibly sharp on all screens.
2. **CPU/GPU Sleep States:** All canvas animation loops utilize an `IntersectionObserver` to pause `requestAnimationFrame` updates when the canvas components scroll out of view. This minimizes power consumption, heat, and battery drain on mobile displays.
3. **Mobile & Touch Compatibility:** Added full touch gesture support (`touchstart`, `touchmove`, `touchend`) for showcase rotation on tablets/smartphones. Automatically detects touch capabilities to disable custom mouse cursor elements, ensuring native pointer behaviors are preserved on coarse interfaces.
4. **Theme Preference Persistence:** The light/dark toggle queries user operating system dark-mode choices (`prefers-color-scheme`) on initial visits and persists user choices locally using `localStorage`.

## 🔒 Security Hardening

- **Tabnabbing Protection:** Added `rel="noopener noreferrer"` to all outbound external links targeting `_blank` tabs to prevent referrer hijack exploits.
- **XSS & CSP Compliance:** Eliminated all inline script event bindings (e.g., `onclick="..."`) from the DOM and migrated interactions to secure event listeners in the `js/main.js` script.
- **Secure Form Sanitization:** Built a strict validation checker checking input lengths, valid pattern match structures, and formatting fields prior to dispatching forms.

## 🚀 Running Locally

To run the application locally without build issues, use any basic static server:

```bash
# Using Node.js live-server
npx live-server

# Or Python 3 HTTP Server
python -m http.server 8000
```
