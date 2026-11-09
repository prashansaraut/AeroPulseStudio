# AeroPulse Studio — Bespoke Audio Gear Configurator

[![Yuva Intern](https://img.shields.io/badge/Yuva%20Intern-Week%203%20Task-6366f1.svg)](https://yuvaintern.com)
[![Frontend](https://img.shields.io/badge/Role-Frontend%20Developer%20Intern-06b6d4.svg)]()
[![Pure Vanilla JS](https://img.shields.io/badge/JavaScript-ES6%2B%20(No%20Frameworks)-f59e0b.svg)]()
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-3Band%20Biquad%20Filters-10b981.svg)]()
[![Semantic HTML5](https://img.shields.io/badge/HTML5-Accessible%20%26%20Semantic-10b981.svg)]()
[![Modern CSS3](https://img.shields.io/badge/CSS3-3D%20Parallax%20%26%20Glassmorphism-3b82f6.svg)]()

> An enterprise-grade, interactive web application engineered from the ground up using **Vanilla JavaScript (ES6+)**, semantic HTML5, and modern CSS3. Features a real-time reactive vector customizer with 3D mouse parallax, Web Audio API live ambient sound synthesizer with 3-band biquad filtering, multi-perspective exploded anatomy inspection, slide-over shopping bag with dynamic financial calculation, live search FAQ, regex form validation, accessible modals, and toast notification queues.

---

## 🎧 Live Demo & Author

- **Author**: Prashansa Raut
- **Role**: Frontend Web Developer Intern
- **Programme**: Yuva Intern Virtual Internship
- **Task**: Week 3 — Integrating JavaScript for Interactive User Experience
- **Live Demo**: [Deploy with GitHub Pages](https://github.com) *(Add your GitHub Pages URL here)*

---

## 🌟 Key Interactive & Realistic Features

### 1. Real-Time SVG Vector Customizer & 3D Mouse Parallax (360° Studio)
- **3D Cursor Parallax & Dynamic Light Glare**: Moving the mouse over the canvas smoothly tilts the headphone in 3D perspective (`rotateX`, `rotateY`) with specular light reflections following the cursor.
- **Multi-Perspective View Switcher**:
  - `Studio Front`: Default clean frontal studio angle.
  - `45° Profile`: Rotates the headphones to inspect the laser plaque and damping gimbal in 3D.
  - `Exploded Anatomy`: Smoothly slides the earcups and cushions apart with spring physics, revealing the internal gold voice coils and 40mm beryllium diaphragm!
- **Interactive Inspection Hotspots**: 4 pulsing inspection pins with animated rings. Clicking reveals an accessible glassmorphic popover tooltip explaining acoustic engineering.
- **Curated Signature Editions**: 1-click aesthetic combinations (*Cyberpunk Neon, Obsidian Stealth, Champagne Royale, Nordic Frost, Imperial Heritage*) that automatically coordinate swatches, bezels, and cushion fabrics.
- **Live Laser Engraving**: Sanitizes and mirrors input live onto the surgical-steel headband plaque via reactive SVG DOM text nodes.
- **Dynamic Price Counter**: Numerical ticker smoothly counts between price states using `requestAnimationFrame` interpolation.

### 2. Live Web Audio API Synthesizer & Soundstage Equalizer
- **Real-Time Sound Synthesis**: Pure client-side audio synthesis using `AudioContext`. Generates relaxing multi-harmonic chord tones with zero external sound files.
- **Hardware-Accelerated 3-Band Biquad Filters**:
  - `lowshelf` filter connected to the Bass Boost (60Hz) slider.
  - `peaking` filter connected to the Mid Presence (1kHz) slider.
  - `highshelf` filter connected to the Treble Air (10kHz) slider.
  - *Moving the sliders in real-time audibly and visibly shapes the sound and visualizer bars!*
- **Volume & Haptic Sound Controls**: Master synthesizer volume slider and interface click haptics (with mute toggle).
- **16-Band Harmonic Visualizer**: Oscillating frequency bars reacting to real-time harmonic math and active EQ parameters.

### 3. Head-to-Head Flagship Benchmark Matrix
- Responsive comparative table comparing AeroPulse Pro 7 vs Sony WH-1000XM5 vs Apple AirPods Max vs Bose QuietComfort Ultra.

### 4. Slide-Over Interactive Shopping Bag Drawer
- **Persistent State**: Items added to the bag are stored in browser `localStorage`.
- **Quantity Management**: Incremental stepping (`+` / `-`) and item removal with automatic subtotal, 18% GST calculation, and grand total updates.
- **Free Shipping Threshold Bar**: Dynamic progress meter showing remaining amount to unlock free express shipping.
- **Coupon & Promo Engine**: Real-time coupon validator with shake animation feedback on errors and percentage deduction for valid codes (`YUVA25` for 25% off, `AERO10` for 10% off).
- **Checkout Simulator**: Non-blocking asynchronous checkout state with loading indicator and confirmation toast.

### 5. Floating Quick-Order Sticky Bar
- Automatically slides into view when the user scrolls past the main purchase area, allowing instant ordering without scrolling back to the top.

### 6. Real-Time Live FAQ Search
- Search bar that dynamically filters and highlights questions as you type with match counters and empty states.

### 7. Interactive Review Modal & Regex Form Validation
- **Interactive 5-Star Rating Picker**: Real-time hover preview and click selection with custom dynamic descriptor strings.
- **Client-Side Validation Engine**: Validates full name (min 3 characters), email address (RFC compliance regex), and review feedback (min 15 characters).
- **Dynamic Card Prepending**: Valid reviews are sanitized (preventing XSS) and injected directly at the top of the reviews grid with entrance animation.

### 8. Shareable Custom Build Links
- Serializes custom configurations into URL query parameters (`?color=...&accent=...&cushion=...&engraving=...`) and copies to clipboard for 1-click sharing.

### 9. Client Authentication & Session Management (Sign In / Sign Out & Log In / Log Out)
- **Modal Dialog with Dual Tabs**: Seamlessly toggle between "Sign In" and "Create Account" with tab animations and keyboard trap support.
- **One-Click Quick Demo Sign-In**: Instant sign-in pre-configured as intern author **Prashansa Raut** (`prashansa.raut@yuva-intern.org`).
- **Interactive Password Controls**: Live show/hide password toggle button and real-time password strength meter checking character length, uppercase, numbers, and symbols.
- **User Avatar & Profile Dropdown**: Once logged in, the header displays a personalized avatar with user initials and a green online status indicator. Clicking opens a dropdown menu with user details, VIP badge, direct access to saved builds, bag link, and a red "Sign Out" option.
- **Persistent Client Sessions**: Authentication status and credentials are securely maintained in browser `localStorage` across page reloads.

### 10. "My Saved Builds" Profile Storage
- **Save to Account**: Clicking the Save button in the customizer stores the active build directly into the user's profile and browser storage.
- **Saved Builds Manager Dialog**: Review all saved custom builds with color swatch previews, full hardware specifications, pricing, and save dates.
- **One-Click Instant Load**: Clicking "Load" on any saved build automatically restores that configuration in the 360° visualizer, updates the SVG DOM, and recalculates pricing in real time!

---

## 📂 Project Structure

```text
aeropulse-audio-studio/
├── index.html              # Semantic HTML5 with accessible landmarks & dialogs
├── styles.css              # Mobile-first CSS tokens, 3D parallax, glassmorphism
├── app.js                  # Modular Vanilla JS controller & Web Audio engine
├── README.md               # Project documentation & GitHub guide
└── assets/
    ├── favicon.svg         # High-resolution vector favicon
    ├── illustrations/
    │   └── headphone.svg   # Multi-layered standalone vector artwork
    └── icons/              # 11 hand-crafted SVG UI icons
        ├── cart.svg, sun.svg, moon.svg, star.svg, trash.svg,
        ├── close.svg, check.svg, sparkles.svg, shield.svg,
        ├── truck.svg, volume.svg
```

---

## 🚀 Running the Project Locally

No build step, bundlers, or Node.js packages are required!

1. Open File Explorer and navigate to:
   ```text
   C:\Users\MANTHAN RAUT\.gemini\antigravity\scratch\aeropulse-audio-studio\
   ```
2. Double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.

---

## 👤 Author

**Prashansa Raut**  
*Frontend Web Developer Intern*  
*Yuva Intern Virtual Internship Programme*
