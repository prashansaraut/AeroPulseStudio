/**
 * ============================================================================
 * AeroPulse Studio — Main Application Controller
 * Author: Prashansa Raut (Frontend Web Developer Intern, Yuva Intern)
 * Architecture: Clean Vanilla JavaScript (No libraries, no frameworks)
 * Demonstrating:
 *   - DOM Manipulation & Event Delegation
 *   - Web Audio API Live Ambient Sound Synthesis & Biquad Filtering
 *   - 3D Mouse Parallax Tilt & Specular Light Tracking
 *   - Multi-Perspective View Switching & Exploded Anatomy Mode
 *   - Interactive Hotspot Tooltips & Inspection System
 *   - Real-Time Dynamic Price Calculations & Number Ticker
 *   - LocalStorage State Persistence & Dual Theme Architecture
 *   - Real-Time Live FAQ Search & Filtering
 *   - Form Regex Validation & XSS Sanitization
 * ============================================================================
 */

'use strict';

// Ensure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  AeroPulseApp.init();
});

const AeroPulseApp = (() => {
  // --------------------------------------------------------------------------
  // 1. APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    config: {
      basePrice: 14999,
      color: {
        id: 'cyan',
        name: 'Cyber Cyan',
        price: 0,
        light: '#38bdf8',
        main: '#0284c7',
        dark: '#0369a1'
      },
      accent: {
        id: 'gold',
        name: 'Sunset Gold',
        price: 0,
        hex: '#f59e0b'
      },
      cushion: {
        id: 'foam',
        name: 'Cloud Memory Foam',
        price: 0,
        hex: '#1e293b'
      },
      engraving: 'AEROPULSE',
      addons: new Map() // Stores active accessories: key -> { name, price }
    },
    cart: [],
    promo: {
      code: '',
      discountPercent: 0,
      applied: false
    },
    eq: {
      preset: 'neutral',
      bass: 0,
      mid: 0,
      treble: 0,
      isStreaming: true,
      animationFrameId: null
    },
    view: 'front', // 'front', 'profile', 'exploded'
    theme: 'dark',
    user: {
      isLoggedIn: false,
      name: '',
      email: '',
      role: 'VIP Studio Member',
      savedBuilds: []
    }
  };

  // Web Audio API Synthesis State
  const audio = {
    ctx: null,
    masterGain: null,
    bassFilter: null,
    midFilter: null,
    trebleFilter: null,
    oscillators: [],
    isPlaying: false,
    soundEffectsMuted: false,
    volume: 0.4
  };

  // Colorway Palette Definitions
  const COLOR_PALETTES = {
    cyan: { name: 'Cyber Cyan', price: 0, light: '#38bdf8', main: '#0284c7', dark: '#0369a1' },
    midnight: { name: 'Obsidian Matte', price: 0, light: '#475569', main: '#1e293b', dark: '#0f172a' },
    silver: { name: 'Titanium Frost', price: 500, light: '#f8fafc', main: '#cbd5e1', dark: '#64748b' },
    gold: { name: 'Champagne Luxe', price: 800, light: '#fef08a', main: '#eab308', dark: '#a16207' },
    emerald: { name: 'Imperial Emerald', price: 600, light: '#6ee7b7', main: '#059669', dark: '#064e3b' }
  };

  const ACCENT_PALETTES = {
    gold: { name: 'Sunset Gold', price: 0, hex: '#f59e0b' },
    silver: { name: 'Chrome Silver', price: 0, hex: '#e2e8f0' },
    crimson: { name: 'Ruby Red', price: 350, hex: '#ef4444' },
    stealth: { name: 'Dark Graphite', price: 0, hex: '#334155' }
  };

  const CUSHION_PALETTES = {
    foam: { name: 'Cloud Memory Foam', price: 0, hex: '#1e293b' },
    mesh: { name: 'Breathable CoolMesh', price: 650, hex: '#334155' },
    leather: { name: 'Italian Lambskin Leather', price: 1200, hex: '#0b1120' }
  };

  const CURATED_EDITIONS = {
    cyberpunk: { name: 'Cyberpunk Neon', color: 'cyan', accent: 'crimson', cushion: 'mesh' },
    stealth: { name: 'Obsidian Stealth', color: 'midnight', accent: 'stealth', cushion: 'leather' },
    champagne: { name: 'Champagne Royale', color: 'gold', accent: 'gold', cushion: 'leather' },
    nordic: { name: 'Nordic Frost', color: 'silver', accent: 'silver', cushion: 'foam' },
    emerald: { name: 'Imperial Heritage', color: 'emerald', accent: 'gold', cushion: 'foam' }
  };

  const EQ_PRESETS = {
    neutral: {
      name: 'Reference Neutral',
      bass: 0,
      mid: 0,
      treble: 0,
      desc: 'Flat, highly disciplined studio curve providing mastering-grade fidelity across the entire audible frequency envelope.'
    },
    bass: {
      name: 'Sub-Bass Punch',
      bass: 6,
      mid: -1,
      treble: 2,
      desc: 'Enhanced low-end sub-frequencies with visceral acoustic slam while preserving clean mids for electronic and hip-hop production.'
    },
    vocal: {
      name: 'Vocal Clarity',
      bass: -2,
      mid: 5,
      treble: 3,
      desc: 'Forward-boosted midrange designed to highlight human vocal nuances, acoustic strings, podcasts, and master dialogue.'
    },
    spatial: {
      name: '3D Spatial Atmos',
      bass: 3,
      mid: 2,
      treble: 5,
      desc: 'Expanded virtual acoustic chamber with elevated treble air and wide stereo imaging for cinematic film scores and gaming.'
    }
  };

  // --------------------------------------------------------------------------
  // 2. DOM ELEMENT SELECTORS
  // --------------------------------------------------------------------------
  const DOM = {
    root: document.documentElement,
    themeToggle: document.getElementById('theme-toggle'),
    soundEffectsToggle: document.getElementById('sound-effects-toggle'),
    soundOnIcon: document.querySelector('.sound-on-icon'),
    soundOffIcon: document.querySelector('.sound-off-icon'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    mainNav: document.getElementById('main-nav'),
    siteHeader: document.getElementById('site-header'),

    // Curated Editions
    curatedChips: document.querySelectorAll('.curated-chip'),

    // Visual Canvas, 3D Parallax & SVG Elements
    visualCanvasCard: document.getElementById('visual-canvas-card'),
    canvasGlare: document.getElementById('canvas-glare'),
    headphoneWrapper: document.getElementById('headphone-wrapper'),
    headphoneSvg: document.getElementById('headphone-vector'),
    engravingSvgText: document.getElementById('hp-engraving-text'),
    testAudioBtn: document.getElementById('test-audio-btn'),
    testAudioLabel: document.getElementById('test-audio-label'),
    synthVolumeSlider: document.getElementById('synth-volume-slider'),
    soundwaveParticles: document.getElementById('soundwave-particles'),
    svgWaveGroup: document.getElementById('hp-soundwave-svg'),

    // Perspective View Buttons
    viewBtns: document.querySelectorAll('.view-btn'),

    // Hotspots & Popover Tooltip
    hotspotPins: document.querySelectorAll('.hotspot-pin'),
    hotspotTooltip: document.getElementById('hotspot-tooltip'),
    tooltipTitle: document.getElementById('tooltip-title'),
    tooltipDesc: document.getElementById('tooltip-desc'),
    tooltipClose: document.getElementById('tooltip-close'),

    // Configurator Control Inputs
    colorSwatches: document.querySelectorAll('.swatch-btn'),
    selectedColorName: document.getElementById('selected-color-name'),
    accentPills: document.querySelectorAll('.pill-btn'),
    selectedAccentName: document.getElementById('selected-accent-name'),
    cushionCards: document.querySelectorAll('.cushion-card'),
    selectedCushionName: document.getElementById('selected-cushion-name'),
    engravingInput: document.getElementById('engraving-input'),
    engravingCount: document.getElementById('engraving-count'),
    clearEngravingBtn: document.getElementById('clear-engraving-btn'),
    addonCheckboxes: document.querySelectorAll('.addon-checkbox'),

    // Price & Add to Cart
    livePriceCounter: document.getElementById('live-price-counter'),
    addToCartBtn: document.getElementById('add-to-cart-btn'),
    shareConfigBtn: document.getElementById('share-config-btn'),
    saveConfigBtn: document.getElementById('save-config-btn'),

    // Equalizer
    eqVisualizer: document.getElementById('visualizer-spectrum'),
    freqBars: document.querySelectorAll('.freq-bar'),
    currentEqPresetName: document.getElementById('current-eq-preset-name'),
    eqAcousticDesc: document.getElementById('eq-acoustic-desc'),
    eqPresetBtns: document.querySelectorAll('.preset-btn'),
    toggleEqStreamBtn: document.getElementById('toggle-eq-stream-btn'),
    eqStreamText: document.getElementById('eq-stream-text'),
    bassSlider: document.getElementById('eq-bass-slider'),
    midSlider: document.getElementById('eq-mid-slider'),
    trebleSlider: document.getElementById('eq-treble-slider'),
    bassValLabel: document.getElementById('bass-val-label'),
    midValLabel: document.getElementById('mid-val-label'),
    trebleValLabel: document.getElementById('treble-val-label'),
    resetEqBtn: document.getElementById('reset-eq-btn'),

    // Specs Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // FAQ Accordion & Live Search
    faqSearchInput: document.getElementById('faq-search-input'),
    faqClearSearchBtn: document.getElementById('faq-clear-search-btn'),
    faqMatchCount: document.getElementById('faq-match-count'),
    faqEmptySearch: document.getElementById('faq-empty-search'),
    faqItems: document.querySelectorAll('.accordion-item'),
    faqTriggers: document.querySelectorAll('.accordion-trigger'),

    // Floating Quick-Order Sticky Bar
    floatingQuickBar: document.getElementById('floating-quick-bar'),
    quickBarSubtitle: document.getElementById('quick-bar-subtitle'),
    quickBarPrice: document.getElementById('quick-bar-price'),
    quickBarAddBtn: document.getElementById('quick-bar-add-btn'),

    // Cart Drawer
    cartToggleBtn: document.getElementById('cart-toggle-btn'),
    closeCartBtn: document.getElementById('close-cart-btn'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartBackdrop: document.getElementById('cart-backdrop'),
    cartCounter: document.getElementById('cart-counter'),
    cartItemsCountBadge: document.getElementById('cart-items-count-badge'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    cartEmptyState: document.getElementById('cart-empty-state'),
    emptyStateCta: document.getElementById('empty-state-cta'),
    shippingProgressText: document.getElementById('shipping-progress-text'),
    shippingProgressFill: document.getElementById('shipping-progress-fill'),
    promoInput: document.getElementById('promo-input'),
    applyPromoBtn: document.getElementById('apply-promo-btn'),
    promoFeedback: document.getElementById('promo-feedback'),
    cartSubtotalVal: document.getElementById('cart-subtotal-val'),
    discountLine: document.getElementById('discount-line'),
    discountPctLabel: document.getElementById('discount-pct-label'),
    cartDiscountVal: document.getElementById('cart-discount-val'),
    cartTaxVal: document.getElementById('cart-tax-val'),
    cartGrandTotalVal: document.getElementById('cart-grand-total-val'),
    checkoutBtn: document.getElementById('checkout-btn'),

    // Reviews & Modal
    openReviewModalBtn: document.getElementById('open-review-modal-btn'),
    closeReviewModalBtn: document.getElementById('close-review-modal-btn'),
    cancelReviewBtn: document.getElementById('cancel-review-btn'),
    reviewModal: document.getElementById('review-modal'),
    reviewModalBackdrop: document.getElementById('review-modal-backdrop'),
    reviewForm: document.getElementById('review-form'),
    starPicker: document.getElementById('star-picker'),
    starPickBtns: document.querySelectorAll('.star-pick-btn'),
    ratingDescriptor: document.getElementById('rating-descriptor'),
    reviewAuthorName: document.getElementById('review-author-name'),
    reviewEmail: document.getElementById('review-email'),
    reviewComment: document.getElementById('review-comment'),
    commentCharCount: document.getElementById('comment-char-count'),
    nameErrorMsg: document.getElementById('name-error-msg'),
    emailErrorMsg: document.getElementById('email-error-msg'),
    commentErrorMsg: document.getElementById('comment-error-msg'),
    reviewsGrid: document.getElementById('reviews-grid'),
    totalReviewsLabel: document.getElementById('total-reviews-label'),

    // Toast Container
    toastContainer: document.getElementById('toast-container'),

    // Authentication & User Profile
    authActionWrap: document.getElementById('auth-action-wrap'),
    openAuthModalBtn: document.getElementById('open-auth-modal-btn'),
    userProfileWrap: document.getElementById('user-profile-wrap'),
    userMenuBtn: document.getElementById('user-menu-btn'),
    userAvatarInitials: document.getElementById('user-avatar-initials'),
    userDropdownMenu: document.getElementById('user-dropdown-menu'),
    dropdownUserName: document.getElementById('dropdown-user-name'),
    dropdownUserEmail: document.getElementById('dropdown-user-email'),
    mySavedBuildsBtn: document.getElementById('my-saved-builds-btn'),
    badgeSavedCount: document.getElementById('badge-saved-count'),
    openCartFromMenu: document.getElementById('open-cart-from-menu'),
    signOutBtn: document.getElementById('sign-out-btn'),

    // Auth Modal
    authModalBackdrop: document.getElementById('auth-modal-backdrop'),
    authModal: document.getElementById('auth-modal'),
    closeAuthModalBtn: document.getElementById('close-auth-modal-btn'),
    tabLoginBtn: document.getElementById('tab-login-btn'),
    tabRegisterBtn: document.getElementById('tab-register-btn'),
    authLoginPane: document.getElementById('auth-login-pane'),
    authRegisterPane: document.getElementById('auth-register-pane'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginEmailError: document.getElementById('login-email-error'),
    loginPasswordError: document.getElementById('login-password-error'),
    demoLoginBtn: document.getElementById('demo-login-btn'),
    registerForm: document.getElementById('register-form'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    strengthBar: document.getElementById('strength-bar'),
    strengthText: document.getElementById('strength-text'),
    registerNameError: document.getElementById('register-name-error'),
    registerEmailError: document.getElementById('register-email-error'),
    registerPasswordError: document.getElementById('register-password-error'),
    togglePasswordBtns: document.querySelectorAll('.toggle-password-btn'),

    // Saved Builds Modal
    savedBuildsModalBackdrop: document.getElementById('saved-builds-modal-backdrop'),
    savedBuildsModal: document.getElementById('saved-builds-modal'),
    closeSavedBuildsBtn: document.getElementById('close-saved-builds-btn'),
    savedBuildsBody: document.getElementById('saved-builds-body'),
    emptySavedBuilds: document.getElementById('empty-saved-builds')
  };

  // --------------------------------------------------------------------------
  // 3. INITIALIZATION
  // --------------------------------------------------------------------------
  const init = () => {
    loadSavedPreferences();
    parseUrlParameters();
    setupThemeHandlers();
    setupSoundEffectHandlers();
    setupCuratedEditions();
    setup3DParallax();
    setupViewSwitching();
    setupHotspots();
    setupWebAudioControls();
    setupConfiguratorHandlers();
    setupEqualizer();
    setupTabs();
    setupFaqLiveSearch();
    setupAccordion();
    setupCartHandlers();
    setupReviewModal();
    setupAuthHandlers();
    setupScrollSpyAndQuickBar();
    updatePriceDisplay(false);

    // Initial greeting
    setTimeout(() => {
      showToast(
        'Welcome to AeroPulse Studio',
        'Explore 360° Studio, test the Web Audio synthesizer, or try Curated Editions.',
        'info',
        4000
      );
    }, 600);
  };

  // --------------------------------------------------------------------------
  // 4. URL PARAMETER PARSER (SHAREABLE BUILDS)
  // --------------------------------------------------------------------------
  const parseUrlParameters = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const colorParam = params.get('color');
      const accentParam = params.get('accent');
      const cushionParam = params.get('cushion');
      const engraveParam = params.get('engraving');

      if (colorParam && COLOR_PALETTES[colorParam]) {
        selectColor(colorParam, false);
      }
      if (accentParam && ACCENT_PALETTES[accentParam]) {
        selectAccent(accentParam, false);
      }
      if (cushionParam && CUSHION_PALETTES[cushionParam]) {
        selectCushion(cushionParam, false);
      }
      if (engraveParam) {
        DOM.engravingInput.value = engraveParam.substring(0, 12);
        updateEngraving(engraveParam.substring(0, 12));
      }

      if (colorParam || engraveParam) {
        setTimeout(() => {
          showToast('Custom Build Loaded', 'Restored shared custom design from URL parameters.', 'success', 3500);
        }, 1200);
      }
    } catch (e) {
      console.warn('URL parsing bypassed:', e);
    }
  };

  // --------------------------------------------------------------------------
  // 5. LOCAL STORAGE & PREFERENCES
  // --------------------------------------------------------------------------
  const loadSavedPreferences = () => {
    try {
      // Theme
      const savedTheme = localStorage.getItem('aeropulse_theme');
      if (savedTheme) {
        state.theme = savedTheme;
        DOM.root.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        state.theme = 'light';
        DOM.root.setAttribute('data-theme', 'light');
      }

      // Audio Mute state
      const savedMute = localStorage.getItem('aeropulse_mute_effects');
      if (savedMute === 'true') {
        audio.soundEffectsMuted = true;
        updateMuteIcons();
      }

      // Saved Cart
      const savedCart = localStorage.getItem('aeropulse_cart');
      if (savedCart) {
        state.cart = JSON.parse(savedCart);
        renderCart();
      }

      // Saved User Session
      const savedUser = localStorage.getItem('aeropulse_auth_user');
      if (savedUser) {
        state.user = { ...state.user, ...JSON.parse(savedUser) };
      }

      // Saved Builds
      const savedBuilds = localStorage.getItem('aeropulse_saved_builds_list');
      if (savedBuilds) {
        state.user.savedBuilds = JSON.parse(savedBuilds);
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  };

  // --------------------------------------------------------------------------
  // 6. THEME & UI SOUND EFFECTS
  // --------------------------------------------------------------------------
  const setupThemeHandlers = () => {
    if (!DOM.themeToggle) return;

    DOM.themeToggle.addEventListener('click', () => {
      playUiTick();
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      DOM.root.setAttribute('data-theme', state.theme);
      try {
        localStorage.setItem('aeropulse_theme', state.theme);
      } catch (e) {}

      showToast(
        `${state.theme === 'dark' ? 'Dark' : 'Light'} Mode Activated`,
        'Display palette dynamically updated.',
        'info',
        2000
      );
    });

    // Mobile Hamburger
    if (DOM.mobileMenuToggle && DOM.mainNav) {
      DOM.mobileMenuToggle.addEventListener('click', () => {
        playUiTick();
        const isOpen = DOM.mainNav.classList.toggle('open');
        DOM.mobileMenuToggle.classList.toggle('active', isOpen);
        DOM.mobileMenuToggle.setAttribute('aria-expanded', isOpen);
      });

      DOM.mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          DOM.mainNav.classList.remove('open');
          DOM.mobileMenuToggle.classList.remove('active');
          DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  };

  const setupSoundEffectHandlers = () => {
    if (!DOM.soundEffectsToggle) return;

    DOM.soundEffectsToggle.addEventListener('click', () => {
      audio.soundEffectsMuted = !audio.soundEffectsMuted;
      updateMuteIcons();
      try {
        localStorage.setItem('aeropulse_mute_effects', audio.soundEffectsMuted);
      } catch (e) {}

      if (!audio.soundEffectsMuted) {
        playUiTick();
      }

      showToast(
        audio.soundEffectsMuted ? 'Sound Effects Muted' : 'Sound Effects Enabled',
        audio.soundEffectsMuted ? 'Interactive audio feedback silenced.' : 'Subtle haptic feedback active.',
        'info',
        2000
      );
    });
  };

  const updateMuteIcons = () => {
    if (!DOM.soundOnIcon || !DOM.soundOffIcon) return;
    DOM.soundOnIcon.style.display = audio.soundEffectsMuted ? 'none' : 'block';
    DOM.soundOffIcon.style.display = audio.soundEffectsMuted ? 'block' : 'none';
  };

  const playUiTick = () => {
    if (audio.soundEffectsMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audio.ctx || new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {}
  };

  // --------------------------------------------------------------------------
  // 7. WEB AUDIO API AMBIENT SYNTHESIZER
  // --------------------------------------------------------------------------
  const initAudioEngine = () => {
    if (audio.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    audio.ctx = new AudioCtx();

    // Master Gain
    audio.masterGain = audio.ctx.createGain();
    audio.masterGain.gain.setValueAtTime(audio.volume, audio.ctx.currentTime);

    // 3-Band Biquad Filters modulated live by Equalizer sliders
    audio.bassFilter = audio.ctx.createBiquadFilter();
    audio.bassFilter.type = 'lowshelf';
    audio.bassFilter.frequency.setValueAtTime(120, audio.ctx.currentTime);
    audio.bassFilter.gain.setValueAtTime(state.eq.bass * 2.5, audio.ctx.currentTime);

    audio.midFilter = audio.ctx.createBiquadFilter();
    audio.midFilter.type = 'peaking';
    audio.midFilter.frequency.setValueAtTime(1000, audio.ctx.currentTime);
    audio.midFilter.Q.setValueAtTime(1.2, audio.ctx.currentTime);
    audio.midFilter.gain.setValueAtTime(state.eq.mid * 2.5, audio.ctx.currentTime);

    audio.trebleFilter = audio.ctx.createBiquadFilter();
    audio.trebleFilter.type = 'highshelf';
    audio.trebleFilter.frequency.setValueAtTime(7500, audio.ctx.currentTime);
    audio.trebleFilter.gain.setValueAtTime(state.eq.treble * 2.5, audio.ctx.currentTime);

    // Signal chain: Source -> Bass -> Mid -> Treble -> MasterGain -> Destination
    audio.bassFilter.connect(audio.midFilter);
    audio.midFilter.connect(audio.trebleFilter);
    audio.trebleFilter.connect(audio.masterGain);
    audio.masterGain.connect(audio.ctx.destination);
  };

  const setupWebAudioControls = () => {
    if (DOM.testAudioBtn) {
      DOM.testAudioBtn.addEventListener('click', toggleAudioSynthesizer);
    }

    if (DOM.synthVolumeSlider) {
      DOM.synthVolumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) / 100;
        audio.volume = val;
        if (audio.masterGain && audio.ctx) {
          audio.masterGain.gain.setValueAtTime(val, audio.ctx.currentTime);
        }
      });
    }
  };

  const toggleAudioSynthesizer = () => {
    initAudioEngine();
    if (!audio.ctx) {
      showToast('Web Audio Notice', 'Browser does not support Web Audio API.', 'info', 2500);
      return;
    }

    if (audio.ctx.state === 'suspended') {
      audio.ctx.resume();
    }

    if (audio.isPlaying) {
      stopAmbientSynth();
      DOM.testAudioLabel.textContent = 'Synthesize Audio';
      DOM.testAudioBtn.classList.remove('btn-primary');
      if (DOM.soundwaveParticles) DOM.soundwaveParticles.classList.remove('active');
      if (DOM.svgWaveGroup) DOM.svgWaveGroup.classList.remove('active');
      showToast('Audio Paused', 'Acoustic synthesizer halted.', 'info', 2000);
    } else {
      startAmbientSynth();
      DOM.testAudioLabel.textContent = 'Stop Synth';
      DOM.testAudioBtn.classList.add('btn-primary');
      if (DOM.soundwaveParticles) DOM.soundwaveParticles.classList.add('active');
      if (DOM.svgWaveGroup) DOM.svgWaveGroup.classList.add('active');
      showToast(
        'Web Audio Synthesizer Active',
        'Generating harmonic chord. Try moving the Bass & Treble sliders to hear it modulate live!',
        'success',
        4000
      );
    }
  };

  const startAmbientSynth = () => {
    initAudioEngine();
    stopAmbientSynth();

    // Harmonics: C3 (130.81Hz), G3 (196Hz), C4 (261.63Hz), E4 (329.63Hz)
    const notes = [130.81, 196.00, 261.63, 329.63];

    notes.forEach((freq, idx) => {
      const osc = audio.ctx.createOscillator();
      const noteGain = audio.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audio.ctx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 4.5, audio.ctx.currentTime);

      const targetGain = (idx === 0 ? 0.35 : 0.2) / notes.length;
      noteGain.gain.setValueAtTime(0.001, audio.ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(targetGain, audio.ctx.currentTime + 0.4);

      osc.connect(noteGain);
      noteGain.connect(audio.bassFilter);

      osc.start();
      audio.oscillators.push({ osc, gain: noteGain });
    });

    audio.isPlaying = true;
  };

  const stopAmbientSynth = () => {
    if (audio.oscillators.length > 0 && audio.ctx) {
      audio.oscillators.forEach(({ osc, gain }) => {
        try {
          gain.gain.setValueAtTime(gain.gain.value, audio.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audio.ctx.currentTime + 0.25);
          setTimeout(() => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          }, 280);
        } catch (e) {}
      });
      audio.oscillators = [];
    }
    audio.isPlaying = false;
  };

  // --------------------------------------------------------------------------
  // 8. 3D MOUSE PARALLAX TILT & SPECULAR GLARE
  // --------------------------------------------------------------------------
  const setup3DParallax = () => {
    if (!DOM.visualCanvasCard || !DOM.headphoneWrapper) return;

    DOM.visualCanvasCard.addEventListener('mousemove', (e) => {
      // Don't apply parallax if in exploded mode
      if (state.view === 'exploded') return;

      const rect = DOM.visualCanvasCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const tiltX = -percentY * 16;
      const tiltY = percentX * 20;

      DOM.headphoneWrapper.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      if (DOM.canvasGlare) {
        DOM.canvasGlare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`;
      }
    });

    DOM.visualCanvasCard.addEventListener('mouseleave', () => {
      if (state.view === 'exploded') return;
      DOM.headphoneWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  };

  // --------------------------------------------------------------------------
  // 9. PERSPECTIVE VIEW SWITCHING & EXPLODED ANATOMY
  // --------------------------------------------------------------------------
  const setupViewSwitching = () => {
    DOM.viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiTick();
        const viewMode = btn.getAttribute('data-view');
        setViewMode(viewMode);
      });
    });
  };

  const setViewMode = (viewMode) => {
    state.view = viewMode;

    DOM.viewBtns.forEach(b => {
      const isMatch = b.getAttribute('data-view') === viewMode;
      b.classList.toggle('active', isMatch);
      b.setAttribute('aria-checked', isMatch);
    });

    // Reset view classes on canvas card
    DOM.visualCanvasCard.classList.remove('view-exploded', 'view-profile');

    if (viewMode === 'exploded') {
      DOM.visualCanvasCard.classList.add('view-exploded');
      DOM.headphoneWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1.02, 1.02, 1.02)';
      showToast('Exploded Anatomy View', 'Revealing 40mm Beryllium core, voice coils, and magnetic seal.', 'info', 3000);
    } else if (viewMode === 'profile') {
      DOM.visualCanvasCard.classList.add('view-profile');
      showToast('45° Side Profile', 'Displaying laser engraving plaque and stepless damping hinge.', 'info', 2500);
    } else {
      DOM.headphoneWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  // --------------------------------------------------------------------------
  // 10. INTERACTIVE INSPECTION HOTSPOTS
  // --------------------------------------------------------------------------
  const setupHotspots = () => {
    DOM.hotspotPins.forEach(pin => {
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        playUiTick();
        const title = pin.getAttribute('data-title');
        const desc = pin.getAttribute('data-desc');

        if (DOM.tooltipTitle) DOM.tooltipTitle.textContent = title;
        if (DOM.tooltipDesc) DOM.tooltipDesc.textContent = desc;

        DOM.hotspotTooltip.classList.add('active');
        DOM.hotspotTooltip.setAttribute('aria-hidden', 'false');
      });
    });

    if (DOM.tooltipClose) {
      DOM.tooltipClose.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.hotspotTooltip.classList.remove('active');
        DOM.hotspotTooltip.setAttribute('aria-hidden', 'true');
      });
    }

    document.addEventListener('click', (e) => {
      if (DOM.hotspotTooltip && !DOM.hotspotTooltip.contains(e.target) && !e.target.closest('.hotspot-pin')) {
        DOM.hotspotTooltip.classList.remove('active');
        DOM.hotspotTooltip.setAttribute('aria-hidden', 'true');
      }
    });
  };

  // --------------------------------------------------------------------------
  // 11. CURATED SIGNATURE EDITIONS
  // --------------------------------------------------------------------------
  const setupCuratedEditions = () => {
    DOM.curatedChips.forEach(chip => {
      chip.addEventListener('click', () => {
        playUiTick();
        const editionKey = chip.getAttribute('data-edition');
        applyCuratedEdition(editionKey);
      });
    });
  };

  const applyCuratedEdition = (editionKey) => {
    const edition = CURATED_EDITIONS[editionKey];
    if (!edition) return;

    DOM.curatedChips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-edition') === editionKey);
    });

    selectColor(edition.color, false);
    selectAccent(edition.accent, false);
    selectCushion(edition.cushion, false);

    showToast('Signature Edition Applied', `Configured with ${edition.name} aesthetic scheme.`, 'success', 2800);
  };

  // --------------------------------------------------------------------------
  // 12. CONFIGURATOR CONTROLS & SVG REACTIVITY
  // --------------------------------------------------------------------------
  const setupConfiguratorHandlers = () => {
    // Color Swatches
    DOM.colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        playUiTick();
        const colorKey = swatch.getAttribute('data-color');
        selectColor(colorKey);
        // Deselect curated chip if custom selected
        DOM.curatedChips.forEach(c => c.classList.remove('active'));
      });
    });

    // Accent Ring Pills
    DOM.accentPills.forEach(pill => {
      pill.addEventListener('click', () => {
        playUiTick();
        const accentKey = pill.getAttribute('data-accent');
        selectAccent(accentKey);
      });
    });

    // Ear Cushions
    DOM.cushionCards.forEach(card => {
      card.addEventListener('click', () => {
        playUiTick();
        const cushionKey = card.getAttribute('data-cushion');
        selectCushion(cushionKey);
      });
    });

    // Laser Engraving
    if (DOM.engravingInput) {
      DOM.engravingInput.addEventListener('input', (e) => {
        let val = e.target.value.toUpperCase();
        val = val.replace(/[^A-Z0-9\s\-_.]/g, '');
        e.target.value = val;
        updateEngraving(val);
      });
    }

    if (DOM.clearEngravingBtn) {
      DOM.clearEngravingBtn.addEventListener('click', () => {
        playUiTick();
        DOM.engravingInput.value = 'AEROPULSE';
        updateEngraving('AEROPULSE');
        showToast('Engraving Reset', 'Restored factory default identifier.', 'info', 1800);
      });
    }

    // Addon Checkboxes
    DOM.addonCheckboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        playUiTick();
        const id = chk.getAttribute('data-id');
        const name = chk.getAttribute('data-name');
        const price = parseInt(chk.getAttribute('data-price'), 10) || 0;

        if (chk.checked) {
          state.config.addons.set(id, { name, price });
        } else {
          state.config.addons.delete(id);
        }
        updatePriceDisplay(true);
      });
    });

    // Save Configuration
    if (DOM.saveConfigBtn) {
      DOM.saveConfigBtn.addEventListener('click', saveCurrentBuildToProfile);
    }

    // Share Custom Build Link
    if (DOM.shareConfigBtn) {
      DOM.shareConfigBtn.addEventListener('click', shareCustomBuild);
    }
  };

  const shareCustomBuild = () => {
    playUiTick();
    const url = new URL(window.location.href);
    url.searchParams.set('color', state.config.color.id);
    url.searchParams.set('accent', state.config.accent.id);
    url.searchParams.set('cushion', state.config.cushion.id);
    if (state.config.engraving) {
      url.searchParams.set('engraving', state.config.engraving);
    }

    const shareUrl = url.toString();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Share Link Copied!', 'Custom build URL copied to your clipboard.', 'success', 3500);
      }).catch(() => fallbackCopy(shareUrl));
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const fallbackCopy = (text) => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
    showToast('Share Link Copied!', 'Custom build URL copied to your clipboard.', 'success', 3500);
  };

  const selectColor = (colorKey, triggerToast = true) => {
    const palette = COLOR_PALETTES[colorKey];
    if (!palette) return;

    state.config.color = { id: colorKey, ...palette };

    DOM.colorSwatches.forEach(btn => {
      const isMatch = btn.getAttribute('data-color') === colorKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch);
    });

    if (DOM.selectedColorName) {
      DOM.selectedColorName.textContent = palette.name;
    }

    DOM.root.style.setProperty('--hp-color-light', palette.light);
    DOM.root.style.setProperty('--hp-color-main', palette.main);
    DOM.root.style.setProperty('--hp-color-dark', palette.dark);

    updatePriceDisplay(true);
    updateQuickBar();

    if (triggerToast) {
      showToast('Colorway Selected', `${palette.name} applied to chassis.`, 'info', 1800);
    }
  };

  const selectAccent = (accentKey, triggerToast = true) => {
    const palette = ACCENT_PALETTES[accentKey];
    if (!palette) return;

    state.config.accent = { id: accentKey, ...palette };

    DOM.accentPills.forEach(btn => {
      const isMatch = btn.getAttribute('data-accent') === accentKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-checked', isMatch);
    });

    if (DOM.selectedAccentName) {
      DOM.selectedAccentName.textContent = palette.name;
    }

    DOM.root.style.setProperty('--accent-ring-color', palette.hex);
    updatePriceDisplay(true);
    updateQuickBar();

    if (triggerToast) {
      showToast('Accent Bezel Updated', `${palette.name} ring fitted.`, 'info', 1800);
    }
  };

  const selectCushion = (cushionKey, triggerToast = true) => {
    const palette = CUSHION_PALETTES[cushionKey];
    if (!palette) return;

    state.config.cushion = { id: cushionKey, ...palette };

    DOM.cushionCards.forEach(card => {
      const isMatch = card.getAttribute('data-cushion') === cushionKey;
      card.classList.toggle('active', isMatch);
      card.setAttribute('aria-checked', isMatch);
    });

    if (DOM.selectedCushionName) {
      DOM.selectedCushionName.textContent = palette.name;
    }

    DOM.root.style.setProperty('--cushion-color', palette.hex);
    updatePriceDisplay(true);

    if (triggerToast) {
      showToast('Cushions Selected', `${palette.name} attached.`, 'info', 1800);
    }
  };

  const updateEngraving = (text) => {
    const cleaned = (text || '').trim();
    state.config.engraving = cleaned;

    if (DOM.engravingSvgText) {
      DOM.engravingSvgText.textContent = cleaned.length > 0 ? cleaned : 'AEROPULSE';
    }

    if (DOM.engravingCount) {
      DOM.engravingCount.textContent = `${cleaned.length} / 12 chars`;
    }
  };

  // --------------------------------------------------------------------------
  // 13. DYNAMIC PRICING & ANIMATED TICKER
  // --------------------------------------------------------------------------
  const calculateCurrentPrice = () => {
    let total = state.config.basePrice;
    total += state.config.color.price;
    total += state.config.accent.price;
    total += state.config.cushion.price;

    state.config.addons.forEach(addon => {
      total += addon.price;
    });

    return total;
  };

  const updatePriceDisplay = (animate = true) => {
    const targetPrice = calculateCurrentPrice();
    if (!DOM.livePriceCounter) return;

    if (!animate) {
      DOM.livePriceCounter.textContent = targetPrice.toLocaleString('en-IN');
      if (DOM.quickBarPrice) DOM.quickBarPrice.textContent = targetPrice.toLocaleString('en-IN');
      return;
    }

    const currentPriceStr = DOM.livePriceCounter.textContent.replace(/,/g, '');
    const startVal = parseInt(currentPriceStr, 10) || targetPrice;
    const duration = 280;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.round(startVal + (targetPrice - startVal) * easedProgress);

      const formatted = currentVal.toLocaleString('en-IN');
      DOM.livePriceCounter.textContent = formatted;
      if (DOM.quickBarPrice) DOM.quickBarPrice.textContent = formatted;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        DOM.livePriceCounter.textContent = targetPrice.toLocaleString('en-IN');
        if (DOM.quickBarPrice) DOM.quickBarPrice.textContent = targetPrice.toLocaleString('en-IN');
      }
    };

    requestAnimationFrame(step);
  };

  const updateQuickBar = () => {
    if (DOM.quickBarSubtitle) {
      DOM.quickBarSubtitle.textContent = `${state.config.color.name} • ${state.config.accent.name} Bezel`;
    }
  };

  // --------------------------------------------------------------------------
  // 14. EQUALIZER & LIVE SPECTRUM ANIMATION
  // --------------------------------------------------------------------------
  const setupEqualizer = () => {
    DOM.eqPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiTick();
        const presetKey = btn.getAttribute('data-preset');
        applyEqPreset(presetKey);
      });
    });

    const handleSliderInput = () => {
      state.eq.preset = 'custom';
      state.eq.bass = parseInt(DOM.bassSlider.value, 10);
      state.eq.mid = parseInt(DOM.midSlider.value, 10);
      state.eq.treble = parseInt(DOM.trebleSlider.value, 10);

      DOM.bassValLabel.textContent = `${state.eq.bass > 0 ? '+' : ''}${state.eq.bass} dB`;
      DOM.midValLabel.textContent = `${state.eq.mid > 0 ? '+' : ''}${state.eq.mid} dB`;
      DOM.trebleValLabel.textContent = `${state.eq.treble > 0 ? '+' : ''}${state.eq.treble} dB`;

      // Live modulation of Web Audio API filters
      if (audio.bassFilter && audio.ctx) {
        audio.bassFilter.gain.setValueAtTime(state.eq.bass * 2.5, audio.ctx.currentTime);
      }
      if (audio.midFilter && audio.ctx) {
        audio.midFilter.gain.setValueAtTime(state.eq.mid * 2.5, audio.ctx.currentTime);
      }
      if (audio.trebleFilter && audio.ctx) {
        audio.trebleFilter.gain.setValueAtTime(state.eq.treble * 2.5, audio.ctx.currentTime);
      }

      DOM.eqPresetBtns.forEach(b => b.classList.remove('active'));
      if (DOM.currentEqPresetName) DOM.currentEqPresetName.textContent = 'Custom User DSP';
      if (DOM.eqAcousticDesc) {
        DOM.eqAcousticDesc.textContent = 'Custom user calibration tailored to your unique acoustic preference.';
      }
    };

    if (DOM.bassSlider) DOM.bassSlider.addEventListener('input', handleSliderInput);
    if (DOM.midSlider) DOM.midSlider.addEventListener('input', handleSliderInput);
    if (DOM.trebleSlider) DOM.trebleSlider.addEventListener('input', handleSliderInput);

    if (DOM.resetEqBtn) {
      DOM.resetEqBtn.addEventListener('click', () => {
        playUiTick();
        applyEqPreset('neutral');
        showToast('EQ Reset', 'Restored flat studio mastering baseline.', 'info', 2000);
      });
    }

    if (DOM.toggleEqStreamBtn) {
      DOM.toggleEqStreamBtn.addEventListener('click', () => {
        playUiTick();
        state.eq.isStreaming = !state.eq.isStreaming;
        DOM.eqStreamText.textContent = state.eq.isStreaming ? 'Pause Animation' : 'Resume Animation';
        if (state.eq.isStreaming) {
          startVisualizerAnimation();
        }
      });
    }

    startVisualizerAnimation();
  };

  const applyEqPreset = (presetKey) => {
    const preset = EQ_PRESETS[presetKey];
    if (!preset) return;

    state.eq.preset = presetKey;
    state.eq.bass = preset.bass;
    state.eq.mid = preset.mid;
    state.eq.treble = preset.treble;

    DOM.bassSlider.value = preset.bass;
    DOM.midSlider.value = preset.mid;
    DOM.trebleSlider.value = preset.treble;

    DOM.bassValLabel.textContent = `${preset.bass > 0 ? '+' : ''}${preset.bass} dB`;
    DOM.midValLabel.textContent = `${preset.mid > 0 ? '+' : ''}${preset.mid} dB`;
    DOM.trebleValLabel.textContent = `${preset.treble > 0 ? '+' : ''}${preset.treble} dB`;

    if (audio.bassFilter && audio.ctx) {
      audio.bassFilter.gain.setValueAtTime(preset.bass * 2.5, audio.ctx.currentTime);
    }
    if (audio.midFilter && audio.ctx) {
      audio.midFilter.gain.setValueAtTime(preset.mid * 2.5, audio.ctx.currentTime);
    }
    if (audio.trebleFilter && audio.ctx) {
      audio.trebleFilter.gain.setValueAtTime(preset.treble * 2.5, audio.ctx.currentTime);
    }

    DOM.eqPresetBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-preset') === presetKey);
    });

    if (DOM.currentEqPresetName) DOM.currentEqPresetName.textContent = preset.name;
    if (DOM.eqAcousticDesc) DOM.eqAcousticDesc.textContent = preset.desc;
  };

  const startVisualizerAnimation = () => {
    let tick = 0;

    const animateSpectrum = () => {
      if (!state.eq.isStreaming) return;

      tick += 0.05;

      DOM.freqBars.forEach((bar, index) => {
        const harmonic = Math.sin(tick * 2 + index * 0.45) * 18;
        const noise = (Math.random() - 0.5) * 8;
        let baseHeight = 45 + harmonic + noise;

        if (index < 5) {
          baseHeight += state.eq.bass * 3.5;
        } else if (index < 11) {
          baseHeight += state.eq.mid * 3.2;
        } else {
          baseHeight += state.eq.treble * 3.5;
        }

        const clampedHeight = Math.max(8, Math.min(95, baseHeight));
        bar.style.setProperty('--height', `${clampedHeight}%`);
      });

      state.eq.animationFrameId = requestAnimationFrame(animateSpectrum);
    };

    if (state.eq.animationFrameId) {
      cancelAnimationFrame(state.eq.animationFrameId);
    }
    state.eq.animationFrameId = requestAnimationFrame(animateSpectrum);
  };

  // --------------------------------------------------------------------------
  // 15. SPECIFICATION TABS
  // --------------------------------------------------------------------------
  const setupTabs = () => {
    DOM.tabBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        playUiTick();
        DOM.tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        DOM.tabPanels.forEach(p => {
          p.classList.remove('active');
          p.hidden = true;
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const panelId = btn.getAttribute('aria-controls');
        const activePanel = document.getElementById(panelId);
        if (activePanel) {
          activePanel.classList.add('active');
          activePanel.hidden = false;
        }
      });

      btn.addEventListener('keydown', (e) => {
        let nextIndex = null;
        if (e.key === 'ArrowRight') nextIndex = (index + 1) % DOM.tabBtns.length;
        if (e.key === 'ArrowLeft') nextIndex = (index - 1 + DOM.tabBtns.length) % DOM.tabBtns.length;

        if (nextIndex !== null) {
          DOM.tabBtns[nextIndex].focus();
          DOM.tabBtns[nextIndex].click();
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // 16. LIVE FAQ SEARCH & ACCORDION
  // --------------------------------------------------------------------------
  const setupFaqLiveSearch = () => {
    if (!DOM.faqSearchInput) return;

    DOM.faqSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterFaqQuestions(query);

      if (DOM.faqClearSearchBtn) {
        DOM.faqClearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';
      }
    });

    if (DOM.faqClearSearchBtn) {
      DOM.faqClearSearchBtn.addEventListener('click', () => {
        DOM.faqSearchInput.value = '';
        DOM.faqClearSearchBtn.style.display = 'none';
        filterFaqQuestions('');
        DOM.faqSearchInput.focus();
      });
    }
  };

  const filterFaqQuestions = (query) => {
    let matchCount = 0;

    DOM.faqItems.forEach(item => {
      const questionText = item.querySelector('.accordion-trigger span').textContent.toLowerCase();
      const keywords = (item.getAttribute('data-question') || '').toLowerCase();
      const answerText = item.querySelector('.panel-inner').textContent.toLowerCase();

      const isMatch = !query || questionText.includes(query) || keywords.includes(query) || answerText.includes(query);

      item.classList.toggle('search-hidden', !isMatch);
      if (isMatch) matchCount++;

      // If matching, auto-expand
      if (query && isMatch) {
        const trigger = item.querySelector('.accordion-trigger');
        const panel = item.querySelector('.accordion-panel');
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        panel.classList.add('open');
      }
    });

    if (DOM.faqMatchCount) {
      DOM.faqMatchCount.textContent = `Showing ${matchCount} of ${DOM.faqItems.length} questions`;
    }

    if (DOM.faqEmptySearch) {
      DOM.faqEmptySearch.style.display = matchCount === 0 ? 'block' : 'none';
    }
  };

  const setupAccordion = () => {
    DOM.faqTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        playUiTick();
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        const panelId = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);

        trigger.setAttribute('aria-expanded', !isExpanded);

        if (panel) {
          if (!isExpanded) {
            panel.hidden = false;
            requestAnimationFrame(() => panel.classList.add('open'));
          } else {
            panel.classList.remove('open');
            setTimeout(() => { panel.hidden = true; }, 300);
          }
        }
      });
    });
  };

  // --------------------------------------------------------------------------
  // 17. SHOPPING CART & PROMO ENGINE
  // --------------------------------------------------------------------------
  const setupCartHandlers = () => {
    if (DOM.cartToggleBtn) DOM.cartToggleBtn.addEventListener('click', () => { playUiTick(); openCart(); });
    if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener('click', () => { playUiTick(); closeCart(); });
    if (DOM.cartBackdrop) DOM.cartBackdrop.addEventListener('click', closeCart);

    if (DOM.emptyStateCta) {
      DOM.emptyStateCta.addEventListener('click', () => {
        closeCart();
        document.getElementById('configurator-section').scrollIntoView({ behavior: 'smooth' });
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCart();
        closeReviewModal();
      }
    });

    if (DOM.addToCartBtn) {
      DOM.addToCartBtn.addEventListener('click', () => {
        playUiTick();
        addItemToCart();
      });
    }

    if (DOM.quickBarAddBtn) {
      DOM.quickBarAddBtn.addEventListener('click', () => {
        playUiTick();
        addItemToCart();
      });
    }

    if (DOM.cartItemsContainer) {
      DOM.cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const cartItemEl = target.closest('.cart-item');
        if (!cartItemEl) return;

        const itemId = cartItemEl.getAttribute('data-item-id');

        if (target.classList.contains('qty-plus') || target.closest('.qty-plus')) {
          playUiTick();
          updateItemQuantity(itemId, 1);
        } else if (target.classList.contains('qty-minus') || target.closest('.qty-minus')) {
          playUiTick();
          updateItemQuantity(itemId, -1);
        } else if (target.classList.contains('remove-item-btn')) {
          playUiTick();
          removeItemFromCart(itemId);
        }
      });
    }

    if (DOM.applyPromoBtn) {
      DOM.applyPromoBtn.addEventListener('click', applyPromoCode);
    }

    if (DOM.checkoutBtn) {
      DOM.checkoutBtn.addEventListener('click', handleCheckout);
    }
  };

  const openCart = () => {
    DOM.cartDrawer.classList.add('active');
    DOM.cartBackdrop.classList.add('active');
    DOM.cartDrawer.setAttribute('aria-hidden', 'false');
    DOM.cartBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    DOM.cartDrawer.classList.remove('active');
    DOM.cartBackdrop.classList.remove('active');
    DOM.cartDrawer.setAttribute('aria-hidden', 'true');
    DOM.cartBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const addItemToCart = () => {
    const itemPrice = calculateCurrentPrice();
    const addonNames = Array.from(state.config.addons.values()).map(a => a.name);
    const summary = `${state.config.color.name} • ${state.config.accent.name} Bezel • ${state.config.cushion.name}${addonNames.length ? ' • ' + addonNames.join(', ') : ''}`;

    const cartItem = {
      id: 'item_' + Date.now(),
      name: 'AeroPulse Pro 7 (Bespoke Build)',
      colorway: state.config.color.name,
      engraving: state.config.engraving || 'None',
      summary: summary,
      unitPrice: itemPrice,
      quantity: 1,
      swatchClass: `swatch-${state.config.color.id}`
    };

    state.cart.push(cartItem);
    saveCartState();
    renderCart();

    DOM.cartCounter.classList.add('bump');
    setTimeout(() => DOM.cartCounter.classList.remove('bump'), 400);

    showToast(
      'Added to Studio Bag!',
      `Custom ${state.config.color.name} build ready in your cart.`,
      'success',
      3500
    );

    setTimeout(openCart, 300);
  };

  const updateItemQuantity = (itemId, change) => {
    const item = state.cart.find(i => i.id === itemId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      removeItemFromCart(itemId);
      return;
    }

    saveCartState();
    renderCart();
  };

  const removeItemFromCart = (itemId) => {
    state.cart = state.cart.filter(i => i.id !== itemId);
    saveCartState();
    renderCart();
    showToast('Item Removed', 'Build removed from studio bag.', 'info', 2000);
  };

  const saveCartState = () => {
    try {
      localStorage.setItem('aeropulse_cart', JSON.stringify(state.cart));
    } catch (e) {}
  };

  const renderCart = () => {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

    DOM.cartCounter.textContent = totalItems;
    DOM.cartItemsCountBadge.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;

    DOM.cartItemsContainer.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (state.cart.length === 0) {
      DOM.cartEmptyState.style.display = 'flex';
      updateFinancialSummary(0);
      return;
    }

    DOM.cartEmptyState.style.display = 'none';

    let subtotal = 0;

    state.cart.forEach(item => {
      const lineTotal = item.unitPrice * item.quantity;
      subtotal += lineTotal;

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.setAttribute('data-item-id', item.id);

      itemEl.innerHTML = `
        <div class="item-thumb-box">
          <span class="swatch-preview ${item.swatchClass}" style="width: 32px; height: 32px; border-radius: 50%;"></span>
        </div>
        <div class="item-details">
          <h4 class="item-name">${item.name}</h4>
          <span class="item-config-summary">${item.summary}</span>
          <span class="item-config-summary" style="color: var(--accent-cyan); font-weight: 600;">Laser Engraved: "${item.engraving}"</span>
          <span class="item-price">₹${item.unitPrice.toLocaleString('en-IN')} each</span>

          <div class="item-actions-row">
            <div class="quantity-stepper">
              <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="remove-item-btn">Remove</button>
          </div>
        </div>
      `;

      DOM.cartItemsContainer.appendChild(itemEl);
    });

    updateFinancialSummary(subtotal);
  };

  const updateFinancialSummary = (subtotal) => {
    const threshold = 20000;
    const progress = Math.min((subtotal / threshold) * 100, 100);

    if (DOM.shippingProgressFill) {
      DOM.shippingProgressFill.style.width = `${progress}%`;
    }

    if (DOM.shippingProgressText) {
      if (subtotal >= threshold || subtotal === 0) {
        DOM.shippingProgressText.innerHTML = subtotal > 0
          ? '🎉 <strong>Free Express Insured Shipping Unlocked!</strong>'
          : 'Add items to unlock <strong>Free Insured Express Delivery</strong>';
      } else {
        const remaining = threshold - subtotal;
        DOM.shippingProgressText.innerHTML = `Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more for Free Express Delivery!`;
      }
    }

    const discountAmount = state.promo.applied ? Math.round(subtotal * state.promo.discountPercent) : 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(discountedSubtotal * 0.18);
    const grandTotal = discountedSubtotal + taxAmount;

    DOM.cartSubtotalVal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    if (state.promo.applied && discountAmount > 0) {
      DOM.discountLine.style.display = 'flex';
      DOM.discountPctLabel.textContent = `${Math.round(state.promo.discountPercent * 100)}%`;
      DOM.cartDiscountVal.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
    } else {
      DOM.discountLine.style.display = 'none';
    }

    DOM.cartTaxVal.textContent = `₹${taxAmount.toLocaleString('en-IN')}`;
    DOM.cartGrandTotalVal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  };

  const applyPromoCode = () => {
    playUiTick();
    const code = (DOM.promoInput.value || '').trim().toUpperCase();

    if (!code) {
      DOM.promoFeedback.className = 'promo-feedback error';
      DOM.promoFeedback.textContent = 'Please enter a coupon code.';
      DOM.promoInput.classList.add('shake');
      setTimeout(() => DOM.promoInput.classList.remove('shake'), 450);
      return;
    }

    if (code === 'YUVA25') {
      state.promo.code = code;
      state.promo.discountPercent = 0.25;
      state.promo.applied = true;
      DOM.promoFeedback.className = 'promo-feedback success';
      DOM.promoFeedback.textContent = 'Success! 25% Yuva Intern Discount applied.';
      renderCart();
      showToast('Promo Code Applied', '25% discount activated on your total!', 'success', 3000);
    } else if (code === 'AERO10') {
      state.promo.code = code;
      state.promo.discountPercent = 0.10;
      state.promo.applied = true;
      DOM.promoFeedback.className = 'promo-feedback success';
      DOM.promoFeedback.textContent = 'Success! 10% Studio Launch Discount applied.';
      renderCart();
      showToast('Promo Code Applied', '10% discount activated.', 'success', 3000);
    } else {
      DOM.promoFeedback.className = 'promo-feedback error';
      DOM.promoFeedback.textContent = 'Invalid code. Try "YUVA25" or "AERO10".';
      DOM.promoInput.classList.add('shake');
      setTimeout(() => DOM.promoInput.classList.remove('shake'), 450);
    }
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      showToast('Bag is Empty', 'Please configure your headphones first.', 'info', 2500);
      return;
    }

    playUiTick();
    DOM.checkoutBtn.disabled = true;
    DOM.checkoutBtn.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80" stroke-dashoffset="60"></circle>
      </svg>
      <span>Securing Cleanroom Slot...</span>
    `;

    setTimeout(() => {
      DOM.checkoutBtn.disabled = false;
      DOM.checkoutBtn.innerHTML = `
        <span>Proceed to Secure Checkout</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      `;

      closeCart();
      showToast(
        'Order Slot Reserved!',
        'Your bespoke build specification has been queued for cleanroom assembly.',
        'success',
        6000
      );

      state.cart = [];
      saveCartState();
      renderCart();
    }, 1800);
  };

  // --------------------------------------------------------------------------
  // 18. REVIEWS MODAL & REGEX FORM VALIDATION
  // --------------------------------------------------------------------------
  let selectedRating = 5;

  const setupReviewModal = () => {
    if (DOM.openReviewModalBtn) DOM.openReviewModalBtn.addEventListener('click', () => { playUiTick(); openReviewModal(); });
    if (DOM.closeReviewModalBtn) DOM.closeReviewModalBtn.addEventListener('click', () => { playUiTick(); closeReviewModal(); });
    if (DOM.cancelReviewBtn) DOM.cancelReviewBtn.addEventListener('click', () => { playUiTick(); closeReviewModal(); });
    if (DOM.reviewModalBackdrop) DOM.reviewModalBackdrop.addEventListener('click', closeReviewModal);

    DOM.starPickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playUiTick();
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        setRating(rating);
      });

      btn.addEventListener('mouseenter', () => {
        const rating = parseInt(btn.getAttribute('data-rating'), 10);
        highlightStars(rating);
      });
    });

    if (DOM.starPicker) {
      DOM.starPicker.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
      });
    }

    if (DOM.reviewComment) {
      DOM.reviewComment.addEventListener('input', (e) => {
        const len = e.target.value.length;
        DOM.commentCharCount.textContent = `${len} / 250`;
        if (len >= 15) {
          DOM.commentErrorMsg.textContent = '';
        }
      });
    }

    if (DOM.reviewForm) {
      DOM.reviewForm.addEventListener('submit', handleReviewSubmit);
    }
  };

  const openReviewModal = () => {
    // Auto-fill logged-in user credentials
    if (state.user && state.user.isLoggedIn) {
      if (DOM.reviewAuthorName && !DOM.reviewAuthorName.value) {
        DOM.reviewAuthorName.value = state.user.name;
      }
      if (DOM.reviewEmail && !DOM.reviewEmail.value) {
        DOM.reviewEmail.value = state.user.email;
      }
    }

    DOM.reviewModal.classList.add('active');
    DOM.reviewModalBackdrop.classList.add('active');
    DOM.reviewModal.setAttribute('aria-hidden', 'false');
    DOM.reviewModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (DOM.reviewComment) {
      DOM.reviewComment.focus();
    } else {
      DOM.reviewAuthorName.focus();
    }
  };

  const closeReviewModal = () => {
    DOM.reviewModal.classList.remove('active');
    DOM.reviewModalBackdrop.classList.remove('active');
    DOM.reviewModal.setAttribute('aria-hidden', 'true');
    DOM.reviewModalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const setRating = (rating) => {
    selectedRating = rating;
    highlightStars(rating);

    const descriptors = {
      1: '1 Star — Disappointing acoustic balance',
      2: '2 Stars — Needs better tuning',
      3: '3 Stars — Decent for casual listening',
      4: '4 Stars — Very good soundstage & build',
      5: '5 Stars — Exceptional Masterpiece!'
    };
    DOM.ratingDescriptor.textContent = descriptors[rating] || '';
  };

  const highlightStars = (rating) => {
    DOM.starPickBtns.forEach(btn => {
      const btnRating = parseInt(btn.getAttribute('data-rating'), 10);
      btn.classList.toggle('active', btnRating <= rating);
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    playUiTick();

    let isValid = true;

    DOM.nameErrorMsg.textContent = '';
    DOM.emailErrorMsg.textContent = '';
    DOM.commentErrorMsg.textContent = '';

    const nameVal = DOM.reviewAuthorName.value.trim();
    const emailVal = DOM.reviewEmail.value.trim();
    const commentVal = DOM.reviewComment.value.trim();
    const buildTypeVal = document.getElementById('review-build-type').value;

    if (!nameVal || nameVal.length < 3) {
      DOM.nameErrorMsg.textContent = 'Please enter your full name (minimum 3 letters).';
      DOM.reviewAuthorName.classList.add('shake');
      setTimeout(() => DOM.reviewAuthorName.classList.remove('shake'), 450);
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      DOM.emailErrorMsg.textContent = 'Please enter a valid email address.';
      DOM.reviewEmail.classList.add('shake');
      setTimeout(() => DOM.reviewEmail.classList.remove('shake'), 450);
      isValid = false;
    }

    if (!commentVal || commentVal.length < 15) {
      DOM.commentErrorMsg.textContent = 'Please provide detailed feedback (at least 15 characters).';
      DOM.reviewComment.classList.add('shake');
      setTimeout(() => DOM.reviewComment.classList.remove('shake'), 450);
      isValid = false;
    }

    if (!isValid) return;

    const initials = nameVal
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const starIcons = '★'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);

    const reviewArticle = document.createElement('article');
    reviewArticle.className = 'review-card newly-added';

    reviewArticle.innerHTML = `
      <div class="review-card-top">
        <div class="reviewer-avatar" style="background: linear-gradient(135deg, #06b6d4, #6366f1);">${initials}</div>
        <div class="reviewer-meta">
          <h3 class="reviewer-name">${escapeHTML(nameVal)}</h3>
          <span class="reviewer-badge">✓ Verified Owner</span>
        </div>
        <span class="review-date">Just now</span>
      </div>
      <div class="review-stars">${starIcons}</div>
      <p class="review-body">"${escapeHTML(commentVal)}"</p>
      <div class="review-tag">Custom Build: ${escapeHTML(buildTypeVal)}</div>
    `;

    DOM.reviewsGrid.prepend(reviewArticle);
    DOM.totalReviewsLabel.textContent = 'Based on 129 verified ratings';

    DOM.reviewForm.reset();
    DOM.commentCharCount.textContent = '0 / 250';
    setRating(5);
    closeReviewModal();

    showToast('Review Published!', 'Thank you for contributing to our acoustic sound community.', 'success', 4000);
  };

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // --------------------------------------------------------------------------
  // 19. TOAST NOTIFICATION STACK
  // --------------------------------------------------------------------------
  const showToast = (title, message, type = 'info', duration = 3500) => {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const icons = {
      success: '✓',
      info: '🎧',
      error: '⚠️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <strong class="toast-title">${escapeHTML(title)}</strong>
        <span class="toast-message">${escapeHTML(message)}</span>
      </div>
    `;

    toast.addEventListener('click', () => dismissToast(toast));
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => dismissToast(toast), duration);
  };

  const dismissToast = (toast) => {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    setTimeout(() => { toast.remove(); }, 300);
  };

  // --------------------------------------------------------------------------
  // 20. SCROLL SPY & STICKY FLOATING QUICK BAR
  // --------------------------------------------------------------------------
  const setupScrollSpyAndQuickBar = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const mainActionBtn = DOM.addToCartBtn;

    window.addEventListener('scroll', () => {
      if (DOM.siteHeader) {
        DOM.siteHeader.classList.toggle('scrolled', window.scrollY > 20);
      }

      // Scroll Spy active nav highlight
      let currentSectionId = '';
      sections.forEach(section => {
        const top = section.offsetTop - 130;
        const height = section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });

      // Floating Quick Bar reveal when main CTA is scrolled past
      if (mainActionBtn && DOM.floatingQuickBar) {
        const btnRect = mainActionBtn.getBoundingClientRect();
        const shouldShow = btnRect.bottom < 0;
        DOM.floatingQuickBar.classList.toggle('active', shouldShow);
        DOM.floatingQuickBar.setAttribute('aria-hidden', !shouldShow);
      }
    }, { passive: true });
  };

  // --------------------------------------------------------------------------
  // 21. CLIENT AUTHENTICATION & USER SESSION MANAGER
  // --------------------------------------------------------------------------
  const setupAuthHandlers = () => {
    // Open Auth Modal
    if (DOM.openAuthModalBtn) {
      DOM.openAuthModalBtn.addEventListener('click', () => {
        playUiTick();
        openAuthModal('login');
      });
    }

    // Close Auth Modal
    if (DOM.closeAuthModalBtn) {
      DOM.closeAuthModalBtn.addEventListener('click', () => {
        playUiTick();
        closeAuthModal();
      });
    }

    if (DOM.authModalBackdrop) {
      DOM.authModalBackdrop.addEventListener('click', closeAuthModal);
    }

    // Modal Tab Switching
    if (DOM.tabLoginBtn) {
      DOM.tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
    }
    if (DOM.tabRegisterBtn) {
      DOM.tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));
    }

    // Toggle Password Visibility
    DOM.togglePasswordBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = 'Hide';
        } else {
          input.type = 'password';
          btn.textContent = 'Show';
        }
      });
    });

    // Real-Time Password Strength Meter
    if (DOM.registerPassword) {
      DOM.registerPassword.addEventListener('input', (e) => {
        checkPasswordStrength(e.target.value);
      });
    }

    // Sign In Form Submission
    if (DOM.loginForm) {
      DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    }

    // Register Form Submission
    if (DOM.registerForm) {
      DOM.registerForm.addEventListener('submit', handleRegisterSubmit);
    }

    // One-Click Demo Sign In Button
    if (DOM.demoLoginBtn) {
      DOM.demoLoginBtn.addEventListener('click', handleDemoLogin);
    }

    // User Profile Dropdown Toggle
    if (DOM.userMenuBtn) {
      DOM.userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playUiTick();
        toggleUserDropdown();
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (DOM.userProfileWrap && !DOM.userProfileWrap.contains(e.target)) {
        closeUserDropdown();
      }
    });

    // Sign Out Button
    if (DOM.signOutBtn) {
      DOM.signOutBtn.addEventListener('click', () => {
        playUiTick();
        handleSignOut();
      });
    }

    // Open Cart from Dropdown
    if (DOM.openCartFromMenu) {
      DOM.openCartFromMenu.addEventListener('click', () => {
        playUiTick();
        closeUserDropdown();
        openCart();
      });
    }

    // Saved Builds Modal Triggers
    if (DOM.mySavedBuildsBtn) {
      DOM.mySavedBuildsBtn.addEventListener('click', () => {
        playUiTick();
        closeUserDropdown();
        openSavedBuildsModal();
      });
    }

    if (DOM.closeSavedBuildsBtn) {
      DOM.closeSavedBuildsBtn.addEventListener('click', () => {
        playUiTick();
        closeSavedBuildsModal();
      });
    }

    if (DOM.savedBuildsModalBackdrop) {
      DOM.savedBuildsModalBackdrop.addEventListener('click', closeSavedBuildsModal);
    }

    // Keyboard Accessibility (Esc to close open modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.authModal && DOM.authModal.classList.contains('active')) {
          closeAuthModal();
        }
        if (DOM.savedBuildsModal && DOM.savedBuildsModal.classList.contains('active')) {
          closeSavedBuildsModal();
        }
        closeUserDropdown();
      }
    });

    // Initial auth UI update
    updateAuthUI();
    updateSavedBuildsBadge();
  };

  const openAuthModal = (tab = 'login') => {
    switchAuthTab(tab);
    DOM.authModal.classList.add('active');
    DOM.authModalBackdrop.classList.add('active');
    DOM.authModal.setAttribute('aria-hidden', 'false');
    DOM.authModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Auto-focus input
    setTimeout(() => {
      if (tab === 'login' && DOM.loginEmail) {
        DOM.loginEmail.focus();
      } else if (tab === 'register' && DOM.registerName) {
        DOM.registerName.focus();
      }
    }, 150);
  };

  const closeAuthModal = () => {
    DOM.authModal.classList.remove('active');
    DOM.authModalBackdrop.classList.remove('active');
    DOM.authModal.setAttribute('aria-hidden', 'true');
    DOM.authModalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const switchAuthTab = (tab) => {
    playUiTick();
    const isLogin = tab === 'login';

    if (DOM.tabLoginBtn) {
      DOM.tabLoginBtn.classList.toggle('active', isLogin);
      DOM.tabLoginBtn.setAttribute('aria-selected', isLogin);
    }
    if (DOM.tabRegisterBtn) {
      DOM.tabRegisterBtn.classList.toggle('active', !isLogin);
      DOM.tabRegisterBtn.setAttribute('aria-selected', !isLogin);
    }

    if (DOM.authLoginPane) {
      DOM.authLoginPane.classList.toggle('active', isLogin);
    }
    if (DOM.authRegisterPane) {
      DOM.authRegisterPane.classList.toggle('active', !isLogin);
    }
  };

  const checkPasswordStrength = (pwd) => {
    if (!DOM.strengthBar || !DOM.strengthText) return;

    if (!pwd) {
      DOM.strengthBar.className = 'strength-bar';
      DOM.strengthText.textContent = 'Password strength: Empty';
      return;
    }

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    DOM.strengthBar.className = 'strength-bar';

    if (score <= 2) {
      DOM.strengthBar.classList.add('weak');
      DOM.strengthText.textContent = 'Password strength: Weak (Add letters, numbers & symbols)';
    } else if (score <= 4) {
      DOM.strengthBar.classList.add('medium');
      DOM.strengthText.textContent = 'Password strength: Medium (Good, but can be stronger)';
    } else {
      DOM.strengthBar.classList.add('strong');
      DOM.strengthText.textContent = 'Password strength: Strong & Secure! 🔒';
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    // Reset error messages
    if (DOM.loginEmailError) DOM.loginEmailError.textContent = '';
    if (DOM.loginPasswordError) DOM.loginPasswordError.textContent = '';

    const email = DOM.loginEmail ? DOM.loginEmail.value.trim() : '';
    const password = DOM.loginPassword ? DOM.loginPassword.value : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      if (DOM.loginEmailError) DOM.loginEmailError.textContent = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      if (DOM.loginEmailError) DOM.loginEmailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password) {
      if (DOM.loginPasswordError) DOM.loginPasswordError.textContent = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      if (DOM.loginPasswordError) DOM.loginPasswordError.textContent = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (!isValid) {
      if (DOM.loginForm) {
        DOM.loginForm.classList.remove('shake');
        void DOM.loginForm.offsetWidth;
        DOM.loginForm.classList.add('shake');
      }
      return;
    }

    // Success: Extract or format name nicely from email
    let formattedName = '';
    if (email.toLowerCase().includes('prashansa')) {
      formattedName = 'Prashansa Raut';
    } else {
      const username = email.split('@')[0].replace(/[._-]/g, ' ');
      formattedName = username.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    state.user.isLoggedIn = true;
    state.user.name = formattedName || 'Studio Member';
    state.user.email = email;
    state.user.role = 'VIP Studio Member';

    persistUserSession();
    updateAuthUI();
    closeAuthModal();

    showToast(
      'Welcome Back!',
      `Logged in as ${state.user.name}. Your bespoke audio studio is active.`,
      'success',
      3500
    );
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    let isValid = true;

    if (DOM.registerNameError) DOM.registerNameError.textContent = '';
    if (DOM.registerEmailError) DOM.registerEmailError.textContent = '';
    if (DOM.registerPasswordError) DOM.registerPasswordError.textContent = '';

    const name = DOM.registerName ? DOM.registerName.value.trim() : '';
    const email = DOM.registerEmail ? DOM.registerEmail.value.trim() : '';
    const password = DOM.registerPassword ? DOM.registerPassword.value : '';

    if (!name || name.length < 2) {
      if (DOM.registerNameError) DOM.registerNameError.textContent = 'Please enter your full name (at least 2 letters).';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (DOM.registerEmailError) DOM.registerEmailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password || password.length < 6) {
      if (DOM.registerPasswordError) DOM.registerPasswordError.textContent = 'Password must be at least 6 characters.';
      isValid = false;
    }

    if (!isValid) {
      if (DOM.registerForm) {
        DOM.registerForm.classList.remove('shake');
        void DOM.registerForm.offsetWidth;
        DOM.registerForm.classList.add('shake');
      }
      return;
    }

    state.user.isLoggedIn = true;
    state.user.name = name;
    state.user.email = email;
    state.user.role = 'VIP Studio Member';

    persistUserSession();
    updateAuthUI();
    closeAuthModal();

    showToast(
      'Account Created!',
      `Welcome to AeroPulse Studio, ${name}! Your VIP benefits are now unlocked.`,
      'success',
      4000
    );
  };

  const handleDemoLogin = () => {
    playUiTick();
    state.user.isLoggedIn = true;
    state.user.name = 'Prashansa Raut';
    state.user.email = 'prashansa.raut@yuva-intern.org';
    state.user.role = 'VIP Studio Member • Intern Author';

    persistUserSession();
    updateAuthUI();
    closeAuthModal();

    showToast(
      'Demo Access Granted',
      'Signed in as Prashansa Raut (Frontend Web Developer Intern).',
      'success',
      3500
    );
  };

  const handleSignOut = () => {
    state.user.isLoggedIn = false;
    state.user.name = '';
    state.user.email = '';

    try {
      localStorage.removeItem('aeropulse_auth_user');
    } catch (e) {}

    closeUserDropdown();
    updateAuthUI();

    showToast(
      'Signed Out',
      'You have been logged out of AeroPulse Studio. See you again!',
      'info',
      3000
    );
  };

  const persistUserSession = () => {
    try {
      const sessionData = {
        isLoggedIn: state.user.isLoggedIn,
        name: state.user.name,
        email: state.user.email,
        role: state.user.role
      };
      localStorage.setItem('aeropulse_auth_user', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not persist auth session:', e);
    }
  };

  const updateAuthUI = () => {
    const isLoggedIn = state.user && state.user.isLoggedIn;

    if (DOM.openAuthModalBtn) {
      DOM.openAuthModalBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    }

    if (DOM.userProfileWrap) {
      DOM.userProfileWrap.style.display = isLoggedIn ? 'block' : 'none';
    }

    if (isLoggedIn) {
      const initials = state.user.name
        .split(' ')
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'PR';

      if (DOM.userAvatarInitials) {
        DOM.userAvatarInitials.textContent = initials;
      }

      if (DOM.dropdownUserName) {
        DOM.dropdownUserName.textContent = state.user.name;
      }

      if (DOM.dropdownUserEmail) {
        DOM.dropdownUserEmail.textContent = state.user.email;
      }
    }
  };

  const toggleUserDropdown = () => {
    if (!DOM.userDropdownMenu) return;
    const isOpen = DOM.userDropdownMenu.classList.contains('open');
    if (isOpen) {
      closeUserDropdown();
    } else {
      openUserDropdown();
    }
  };

  const openUserDropdown = () => {
    if (!DOM.userDropdownMenu) return;
    DOM.userDropdownMenu.classList.add('open');
    DOM.userDropdownMenu.setAttribute('aria-hidden', 'false');
    if (DOM.userMenuBtn) DOM.userMenuBtn.setAttribute('aria-expanded', 'true');
  };

  const closeUserDropdown = () => {
    if (!DOM.userDropdownMenu) return;
    DOM.userDropdownMenu.classList.remove('open');
    DOM.userDropdownMenu.setAttribute('aria-hidden', 'true');
    if (DOM.userMenuBtn) DOM.userMenuBtn.setAttribute('aria-expanded', 'false');
  };

  // --------------------------------------------------------------------------
  // 22. SAVED BUILDS MANAGER
  // --------------------------------------------------------------------------
  const saveCurrentBuildToProfile = () => {
    playUiTick();
    const currentPrice = calculateCurrentPrice();
    const activeAddons = Array.from(state.config.addons.values()).map(a => a.name);

    const newBuild = {
      id: 'build_' + Date.now(),
      name: `AeroPulse Pro 7 (${state.config.color.name})`,
      colorId: state.config.color.id,
      colorHex: state.config.color.main,
      accentId: state.config.accent.id,
      accentName: state.config.accent.name,
      cushionId: state.config.cushion.id,
      cushionName: state.config.cushion.name,
      engraving: state.config.engraving,
      addons: activeAddons,
      price: currentPrice,
      savedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    if (!state.user.savedBuilds) {
      state.user.savedBuilds = [];
    }
    state.user.savedBuilds.unshift(newBuild);

    try {
      localStorage.setItem('aeropulse_saved_builds_list', JSON.stringify(state.user.savedBuilds));
    } catch (e) {
      console.warn('LocalStorage save build error:', e);
    }

    updateSavedBuildsBadge();

    showToast(
      'Custom Build Saved!',
      `"${newBuild.name}" has been saved to your studio profile & browser.`,
      'success',
      3500
    );
  };

  const updateSavedBuildsBadge = () => {
    const count = (state.user && state.user.savedBuilds) ? state.user.savedBuilds.length : 0;
    if (DOM.badgeSavedCount) {
      DOM.badgeSavedCount.textContent = count;
    }
  };

  const openSavedBuildsModal = () => {
    renderSavedBuilds();
    DOM.savedBuildsModal.classList.add('active');
    DOM.savedBuildsModalBackdrop.classList.add('active');
    DOM.savedBuildsModal.setAttribute('aria-hidden', 'false');
    DOM.savedBuildsModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeSavedBuildsModal = () => {
    DOM.savedBuildsModal.classList.remove('active');
    DOM.savedBuildsModalBackdrop.classList.remove('active');
    DOM.savedBuildsModal.setAttribute('aria-hidden', 'true');
    DOM.savedBuildsModalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const renderSavedBuilds = () => {
    if (!DOM.savedBuildsBody) return;

    const builds = state.user.savedBuilds || [];

    if (builds.length === 0) {
      DOM.savedBuildsBody.innerHTML = `
        <div class="empty-saved-builds">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">💾</span>
          <strong>No Saved Configurations Yet</strong>
          <p style="margin-top: 0.35rem; color: var(--text-secondary); font-size: 0.88rem;">
            Customize your headphones and click the <strong>Save</strong> button in the configurator to store your builds here.
          </p>
        </div>
      `;
      return;
    }

    DOM.savedBuildsBody.innerHTML = builds.map(b => `
      <div class="saved-build-card" data-build-id="${b.id}">
        <span class="saved-build-swatch" style="background-color: ${b.colorHex};"></span>
        <div class="saved-build-info">
          <span class="saved-build-title">${escapeHTML(b.name)}</span>
          <span class="saved-build-specs">
            ${escapeHTML(b.accentName)} Bezel • ${escapeHTML(b.cushionName)} • Engraving: "${escapeHTML(b.engraving)}"
          </span>
          <span class="saved-build-price">₹${b.price.toLocaleString('en-IN')} <small style="font-weight: 400; color: var(--text-muted); font-size: 0.75rem;">• Saved on ${b.savedAt}</small></span>
        </div>
        <div class="saved-build-actions">
          <button type="button" class="btn btn-sm btn-primary load-build-btn" data-build-id="${b.id}">
            Load
          </button>
          <button type="button" class="icon-btn delete-build-btn" data-build-id="${b.id}" aria-label="Delete saved build" title="Delete build" style="width: 32px; height: 32px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners to buttons
    DOM.savedBuildsBody.querySelectorAll('.load-build-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const buildId = btn.getAttribute('data-build-id');
        loadSavedBuildIntoStudio(buildId);
      });
    });

    DOM.savedBuildsBody.querySelectorAll('.delete-build-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const buildId = btn.getAttribute('data-build-id');
        deleteSavedBuild(buildId);
      });
    });
  };

  const loadSavedBuildIntoStudio = (buildId) => {
    playUiTick();
    const build = state.user.savedBuilds.find(b => b.id === buildId);
    if (!build) return;

    // Apply color
    if (build.colorId) selectColor(build.colorId, false);
    // Apply accent
    if (build.accentId) selectAccent(build.accentId, false);
    // Apply cushion
    if (build.cushionId) selectCushion(build.cushionId, false);
    // Apply engraving
    if (build.engraving !== undefined) {
      if (DOM.engravingInput) DOM.engravingInput.value = build.engraving;
      updateEngraving(build.engraving);
    }

    closeSavedBuildsModal();

    // Scroll to customizer
    const customizerEl = document.getElementById('configurator-section');
    if (customizerEl) {
      customizerEl.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(
      'Build Loaded!',
      `"${build.name}" is now loaded into the 360° Studio.`,
      'success',
      3200
    );
  };

  const deleteSavedBuild = (buildId) => {
    playUiTick();
    state.user.savedBuilds = state.user.savedBuilds.filter(b => b.id !== buildId);

    try {
      localStorage.setItem('aeropulse_saved_builds_list', JSON.stringify(state.user.savedBuilds));
    } catch (e) {}

    updateSavedBuildsBadge();
    renderSavedBuilds();

    showToast('Build Deleted', 'Configuration removed from saved list.', 'info', 2000);
  };

  // Public Interface
  return {
    init,
    showToast
  };
})();
