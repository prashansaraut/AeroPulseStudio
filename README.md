# AeroPulse Studio

An interactive product configurator for a fictional pair of wireless headphones, the **AeroPulse Pro 7**. It is my Week 3 task: *Integrating JavaScript for Interactive User Experience* (Yuva Intern, Frontend Web Developer Intern).

Built with plain **HTML5, CSS3 and vanilla JavaScript**. No frameworks and no JavaScript libraries.

![AeroPulse Studio on desktop](report-images/desktop-hero.png)

## Quick links

| What | Where |
|---|---|
| Full technical report (Word) | [`Week3_Report_AeroPulse_Studio.docx`](Week3_Report_AeroPulse_Studio.docx) |
| Full technical report (Markdown) | [`WEEK3_REPORT.md`](WEEK3_REPORT.md) |
| Automated tests (28 tests, all passing) | [`tests/dom-tests.js`](tests/dom-tests.js) |
| JavaScript source | [`app.js`](app.js) |

## What it does

- **Configurator:** pick a colour, accent ring and ear cushions; the SVG headphones recolour and the price counts up or down live.
- **Live laser engraving:** text typed in the box appears on the headband as you type (12 characters, filtered and upper-cased).
- **Three views and 3D tilt:** Studio Front, 45° Profile and Exploded Anatomy; the product tilts with the mouse.
- **Web Audio synthesizer and 3-band equalizer:** a chord generated in the browser plays through bass, mid and treble filters, controlled by sliders and four presets.
- **Shopping bag:** slide-out drawer, quantities, promo codes (`YUVA25`, `AERO10`), free-shipping progress bar and 18% GST totals.
- **Accounts and saved builds:** sign in and register with live validation and a password strength meter; save builds and share them by link.
- **FAQ search, theme toggle, toasts, scroll-aware navigation** and a floating quick-order bar on phones.

## How to run

No build step is needed. Download or clone the repository and open `index.html` in a browser. Click the **Synthesize Audio** button to start the sound (browsers only allow audio after a click).

Shareable build links use URL parameters, for example `index.html?color=gold&engraving=NAME`.

## Project structure

```
AeroPulseStudio/
├── index.html          Structure, ARIA labels, dialogs, SVG headphones
├── styles.css          Design tokens, dark/light themes, 5 responsive breakpoints
├── app.js              All interactivity (22 documented sections)
├── tests/
│   └── dom-tests.js    28 automated DOM tests
├── report-images/      Wireframes, screenshots and diagrams used in the report
├── WEEK3_REPORT.md     Technical report (Markdown)
└── Week3_Report_AeroPulse_Studio.docx   Technical report (Word)
```

## JavaScript code examples

### One shared state object

All values that affect the interface live in a single object. Event handlers update it, then small render functions refresh the page, so different parts of the UI cannot disagree.

```javascript
const state = {
  config: { basePrice: 14999, color: { /* ... */ }, accent: { /* ... */ },
            cushion: { /* ... */ }, engraving: 'AEROPULSE', addons: new Map() },
  cart: [],
  promo: { code: '', discountPercent: 0, applied: false },
  eq: { preset: 'neutral', bass: 0, mid: 0, treble: 0, isStreaming: true },
  view: 'front',          // 'front' | 'profile' | 'exploded'
  theme: 'dark',
  user: { isLoggedIn: false, name: '', email: '', savedBuilds: [] }
};
```

### Live engraving (event handling and DOM manipulation)

```javascript
const updateEngraving = (text) => {
  const cleaned = (text || '').trim();
  state.config.engraving = cleaned;
  DOM.engravingSvgText.textContent = cleaned.length > 0 ? cleaned : 'AEROPULSE';
  DOM.engravingCount.textContent = `${cleaned.length} / 12 chars`;
};
```

`textContent` is used instead of `innerHTML`, so typed text can never be interpreted as HTML.

### Cart totals and promo codes

```javascript
const discountAmount = state.promo.applied
  ? Math.round(subtotal * state.promo.discountPercent) : 0;
const discountedSubtotal = Math.max(0, subtotal - discountAmount);
const taxAmount  = Math.round(discountedSubtotal * 0.18);
const grandTotal = discountedSubtotal + taxAmount;
```

### Web Audio equalizer chain

```javascript
audio.bassFilter.type   = 'lowshelf';  audio.bassFilter.frequency.value   = 120;
audio.midFilter.type    = 'peaking';   audio.midFilter.frequency.value    = 1000;
audio.trebleFilter.type = 'highshelf'; audio.trebleFilter.frequency.value = 7500;

audio.bassFilter.connect(audio.midFilter);
audio.midFilter.connect(audio.trebleFilter);
audio.trebleFilter.connect(audio.masterGain);
audio.masterGain.connect(audio.ctx.destination);
```

Moving a slider changes the matching filter's gain while the sound plays, so the effect is heard immediately. Section 5 of the [report](WEEK3_REPORT.md) explains these and the other features (3D tilt, form validation, FAQ search, shareable links) in detail.

## Testing

The tests in [`tests/dom-tests.js`](tests/dom-tests.js) load the real `index.html` and `app.js` into jsdom (a simulated browser DOM) with a mocked Web Audio API, then click, type and submit forms the way a user would.

```
npm install jsdom        # Node 20 or newer
node tests/dom-tests.js
```

**Result: 28 of 28 tests pass.** They cover:

| Area | Examples checked |
|---|---|
| Configurator and pricing | Colour, accent and cushion change the price from 14,999 to 17,049 |
| Engraving | `yuva intern!` becomes `YUVA INTERN`; input limited to 12 characters |
| Views and theme | View buttons toggle the right classes; theme choice is saved |
| Audio | 4 oscillators and 3 filters at 120, 1000 and 7500 Hz; bass +4 sets filter gain to 10 |
| Cart | GST totals, quantity, `localStorage` persistence, `Esc` closes the drawer |
| Promo codes | `YUVA25` gives 15,089; `AERO10` gives 18,106; invalid and empty codes show errors |
| Forms | Empty and invalid login and register input; password strength weak, medium, strong |
| Accounts | Password is never stored; saved builds and badge count update |
| Shared links | `?color=gold&engraving=PRASHANSA` restores the build; an invalid colour is ignored |

The tests run in a simulated browser, so they do not check real sound output, visual rendering or physical devices. See section 9 of the report.

## Challenges and solutions (summary)

| Problem | Solution |
|---|---|
| No sound on first click | Create the `AudioContext` on a user click and call `resume()` if suspended |
| Header overflowed on phones | At 640 px the account button shrinks to an icon |
| Prices could disagree between panel, bar and bag | One calculation and render path driven by `state` |
| Typed text could inject HTML | `textContent` plus an engraving character filter |
| Broken or malicious share links | Colour names are checked against known options; engraving is sanitized |

The full list is in section 12 of the report.

## Known limitations

- Sign-in is a front-end simulation with no server, so it is not secure; passwords are never stored.
- The spectrum bars react to the equalizer settings but are not an analysis of the real audio signal.
- `app.js` is one large file; splitting it into ES modules is the next step.

## Author

**Prashansa Raut**, Frontend Web Developer Intern, Yuva Intern
