import './style.css';
import { CARDS_DATA, CATEGORIES } from './data/cards.js';
import { CREATORS_DATA } from './data/creators.js';
import { PACKS_DATA } from './data/packs.js';
import { ICONS, NETWORK_LOGOS, EMV_CHIP, NFC_WAVE } from './utils/icons.js';
import { renderCardToCanvas } from './utils/cardRenderer.js';

// Application State
const state = {
  currentRoute: window.location.hash || '#explore',
  theme: localStorage.getItem('cardart:theme') || 'dark',
  activeCategory: 'all',
  density: localStorage.getItem('cardart:density') || 'standard', // 'standard' | 'large'
  sortBy: 'trending',
  searchQuery: '',
  cards: [...CARDS_DATA],
  creators: [...CREATORS_DATA],
  likedCardIds: new Set(JSON.parse(localStorage.getItem('cardart:likes') || '[]')),
  followingCreatorIds: new Set(JSON.parse(localStorage.getItem('cardart:following') || '[]')),
  
  // Hero fan state
  heroCards: [
    { id: 'left', data: CARDS_DATA[4] }, // Apple Cash Liquid Glass
    { id: 'front', data: CARDS_DATA[14] }, // Coutts Silk Private Banking
    { id: 'right', data: CARDS_DATA[36] } // Porsche 911 GT3 RS
  ],

  // Studio / Maker State
  maker: {
    bgType: 'image',
    bgImage: CARDS_DATA[14].image,
    bgColor1: '#4c0519',
    bgColor2: '#be123c',
    gradientAngle: 135,
    network: 'mastercard',
    networkPos: 'br',
    networkScale: 1.0,
    issuerName: 'COUTTS & CO',
    tier: 'PRIVATE BANKING',
    showChip: true,
    chipType: 'gold',
    showNfc: true,
    cardholderName: 'ALEXANDER VANCE',
    cardNumber: '•••• 8821',
    expiry: '12/29',
    finish: 'sheen',
    finishIntensity: 0.5,
    tilt3D: true
  },

  // Modal State
  activeModalCard: null,
  isSearchOpen: false,
  isUploadOpen: false
};

// Initialize Theme
document.documentElement.setAttribute('data-theme', state.theme);

// Toast Notification System
export function showToast(message, icon = ICONS.check) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span style="display:inline-flex;color:var(--accent);">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  }, 2600);
}

// Global Router
function handleRouting() {
  const hash = window.location.hash || '#explore';
  state.currentRoute = hash;
  renderApp();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);

// Render Main App
function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader()}
    <main id="main-content" style="flex:1; display:flex; flex-direction:column;">
      ${renderCurrentRoute()}
    </main>
    ${renderFooter()}
    ${renderCardDetailModal()}
    ${renderSearchModal()}
    ${renderUploadModal()}
  `;

  attachEventListeners();
}

// Render Navigation Header
function renderHeader() {
  const active = state.currentRoute;
  return `
    <header class="site-header">
      <div class="container-page header-inner">
        <a href="#explore" class="brand-link" aria-label="Carder Home">
          ${ICONS.logo}
          <span>Carder</span>
        </a>

        <nav class="nav-links">
          <a href="#explore" class="nav-link ${active === '#explore' || active === '#' ? 'active' : ''}">Explore</a>
          <a href="#make" class="nav-link ${active === '#make' ? 'active' : ''}">Make</a>
          <a href="#guide" class="nav-link ${active === '#guide' ? 'active' : ''}">Guides</a>
          <a href="#pack" class="nav-link ${active === '#pack' ? 'active' : ''}">Packs</a>
          <a href="#overhang" class="nav-link ${active === '#overhang' ? 'active' : ''}">Overhang</a>
        </nav>

        <div class="header-right">
          <button id="header-search-btn" class="header-search-btn" aria-label="Search card art">
            ${ICONS.search}
            <span>Search cards, tags...</span>
            <kbd class="search-kbd">⌘K</kbd>
          </button>

          <button id="theme-toggle-btn" class="btn-icon" aria-label="Toggle dark/light mode" title="Toggle theme">
            ${ICONS.sunMoon}
          </button>

          <button id="btn-upload" class="btn-pill btn-pill-primary" style="margin-left: 0.25rem;">
            ${ICONS.plus}
            <span>Upload</span>
          </button>
        </div>
      </div>
    </header>
  `;
}

// Render Active View
function renderCurrentRoute() {
  switch (state.currentRoute) {
    case '#make':
      return renderMakerStudio();
    case '#guide':
      return renderGuidesPage();
    case '#pack':
      return renderPacksPage();
    case '#overhang':
      return renderOverhangPlayground();
    case '#explore':
    default:
      return `
        ${renderHeroSection()}
        ${renderAboutSection()}
        ${renderExploreSection()}
      `;
  }
}

// 1. Hero Section with 3D Interactive Fan
function renderHeroSection() {
  const activeColor = state.heroCards[1].data.dominantColor;
  return `
    <section class="container-page hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="hero-badge-dot"></span>
          <span>4,733 cards and counting</span>
        </div>
        <h1 class="hero-title">Card art for Apple&nbsp;Wallet, made and <span class="hero-script">shared</span></h1>
        <p class="hero-desc">Pick one you love, or make your own, and put it directly in your Apple Wallet.</p>
        
        <div class="hero-ctas">
          <a href="#explore" class="btn-pill btn-pill-solid hero-cta-btn">
            <span>Explore card art</span>
            ${ICONS.arrowRight}
          </a>
          <a href="#guide" class="btn-pill btn-pill-ghost hero-cta-btn">
            <span>How to use</span>
          </a>
          <a href="#make" class="btn-pill btn-pill-ghost hero-cta-btn">
            <span>Make a card</span>
          </a>
        </div>
      </div>

      <div class="hero-stage">
        <div class="hero-fan-glow" style="background-color: ${activeColor};"></div>
        <div class="hero-fan" id="hero-fan-container">
          <div class="fan-card" data-pos="left" data-card-id="${state.heroCards[0].data.id}">
            <img src="${state.heroCards[0].data.image}" alt="${state.heroCards[0].data.title}" class="fan-card-img" />
            <div class="fan-card-sheen"></div>
          </div>
          <div class="fan-card" data-pos="front" data-card-id="${state.heroCards[1].data.id}">
            <img src="${state.heroCards[1].data.image}" alt="${state.heroCards[1].data.title}" class="fan-card-img" />
            <div class="fan-card-sheen"></div>
          </div>
          <div class="fan-card" data-pos="right" data-card-id="${state.heroCards[2].data.id}">
            <img src="${state.heroCards[2].data.image}" alt="${state.heroCards[2].data.title}" class="fan-card-img" />
            <div class="fan-card-sheen"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 2. About / Description Section (Replaces Creators Section)
function renderAboutSection() {
  return `
    <section class="container-page section-about">
      <div class="about-card-banner">
        <div class="about-header">
          <span class="about-eyebrow">ABOUT CARDER</span>
          <h2 class="about-title">A Curated Gallery & Creation Studio for Apple Wallet Card Art</h2>
          <p class="about-lead">
            Carder is an independent platform dedicated to elevating the digital wallet experience. We bring together iconic credit card textures, transit passes, anime graphics, luxury metallic finishes, and minimalist designs—crafted to look natural in Apple Wallet, Shortcuts, and AirCard.
          </p>
        </div>

        <div class="about-features-grid">
          <div class="about-feature-item">
            <div class="feature-icon-bubble">${ICONS.sparkles}</div>
            <h3 class="feature-heading">Precision Crafted</h3>
            <p class="feature-text">Every card face is engineered to match the official Apple Wallet aspect ratio, natural border curvature, and high-dynamic color clarity.</p>
          </div>

          <div class="about-feature-item">
            <div class="feature-icon-bubble">${ICONS.brush}</div>
            <h3 class="feature-heading">In-Browser Studio</h3>
            <p class="feature-text">Make your own card art in seconds. Upload custom images, add real EMV chips, contactless NFC waves, and payment network marks.</p>
          </div>

          <div class="about-feature-item">
            <div class="feature-icon-bubble">${ICONS.smartphone}</div>
            <h3 class="feature-heading">One-Tap Integration</h3>
            <p class="feature-text">Seamlessly apply your card artworks to iOS using simple native Shortcuts automations or AirCard with zero impact on Apple Pay security.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// 3. Explore & Gallery Grid Section
function renderExploreSection() {
  let filtered = state.cards.filter(c => {
    if (state.activeCategory !== 'all' && c.category !== state.activeCategory) {
      return false;
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchCreator = c.creator.name.toLowerCase().includes(q);
      const matchTag = c.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCreator && !matchTag) return false;
    }
    return true;
  });

  // Sorting
  if (state.sortBy === 'most-liked') {
    filtered.sort((a, b) => b.likes - a.likes);
  } else if (state.sortBy === 'newest') {
    filtered.sort((a, b) => b.downloads - a.downloads);
  }

  return `
    <section class="container-page section-explore" id="gallery-container">
      <div class="explore-toolbar">
        <div class="category-chips">
          ${CATEGORIES.map(cat => `
            <button class="chip-btn ${state.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
              <span>${cat.label}</span>
            </button>
          `).join('')}
        </div>

        <div class="gallery-sub-bar">
          <div class="results-count">
            Showing ${filtered.length} card ${filtered.length === 1 ? 'art' : 'arts'}
          </div>

          <div class="view-controls">
            <select id="gallery-sort-select" class="sort-select">
              <option value="trending" ${state.sortBy === 'trending' ? 'selected' : ''}>Trending</option>
              <option value="most-liked" ${state.sortBy === 'most-liked' ? 'selected' : ''}>Most Liked</option>
              <option value="newest" ${state.sortBy === 'newest' ? 'selected' : ''}>Newest</option>
            </select>

            <button id="density-standard-btn" class="density-toggle-btn ${state.density === 'standard' ? 'active' : ''}" title="Compact Grid">
              ${ICONS.grid}
            </button>
            <button id="density-large-btn" class="density-toggle-btn ${state.density === 'large' ? 'active' : ''}" title="Large Grid">
              ${ICONS.gridLarge}
            </button>
          </div>
        </div>
      </div>

      <div class="card-grid ${state.density === 'large' ? 'density-large' : ''}">
        ${filtered.map(card => {
          const isLiked = state.likedCardIds.has(card.id);
          return `
            <div class="card-item" data-card-id="${card.id}">
              <div class="card-media-wrapper" data-card-id="${card.id}">
                <img src="${card.image}" alt="${card.title}" class="card-img" loading="lazy" />
                <div class="card-sheen-layer"></div>
              </div>

              <div class="card-item-footer">
                <div class="card-info">
                  <a href="javascript:void(0)" class="card-title" data-card-id="${card.id}">${card.title}</a>
                  <a href="javascript:void(0)" class="card-creator-pill">${card.creator.name}</a>
                </div>

                <div class="card-actions">
                  <button class="action-btn-sm btn-like ${isLiked ? 'liked' : ''}" data-card-id="${card.id}">
                    ${isLiked ? ICONS.heartFilled : ICONS.heart}
                    <span>${card.likes}</span>
                  </button>
                  <button class="action-btn-sm btn-quick-download" data-card-id="${card.id}" title="Download 1536x969 PNG">
                    ${ICONS.download}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

// 4. Card Maker Studio (/make)
function renderMakerStudio() {
  const m = state.maker;
  return `
    <div class="maker-page">
      <div class="maker-layout">
        <!-- Sidebar Controls -->
        <aside class="maker-sidebar">
          <div class="maker-tabs">
            <button class="maker-tab active" data-tab="art">Artwork</button>
            <button class="maker-tab" data-tab="network">Network</button>
            <button class="maker-tab" data-tab="issuer">Issuer</button>
            <button class="maker-tab" data-tab="elements">Details</button>
            <button class="maker-tab" data-tab="finishes">Finishes</button>
          </div>

          <div class="maker-panel-content">
            <!-- 1. Artwork Tab -->
            <div class="tab-panel active" id="tab-art">
              <div class="form-group">
                <label class="form-label">Upload Custom Image</label>
                <div class="file-dropzone" id="maker-file-dropzone">
                  <input type="file" id="maker-file-input" accept="image/*" style="display:none;" />
                  ${ICONS.plus}
                  <div style="font-size:0.8125rem; font-weight:600; margin-top:0.4rem; color:var(--ink);">Click or drop image</div>
                  <div style="font-size:0.75rem; color:var(--ink-3); margin-top:0.2rem;">PNG, JPG, or WebP (1536×969 optimal)</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Presets Gallery</label>
                <div class="preset-grid">
                  ${CARDS_DATA.slice(0, 8).map(c => `
                    <div class="preset-thumbnail ${m.bgImage === c.image ? 'active' : ''}" 
                         style="background-image: url('${c.image}');" 
                         data-preset-img="${c.image}"
                         title="${c.title}">
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Dual Color Gradient</label>
                <div class="color-row">
                  <input type="color" id="maker-color1" class="color-input-picker" value="${m.bgColor1}" />
                  <input type="color" id="maker-color2" class="color-input-picker" value="${m.bgColor2}" />
                  <button id="btn-apply-gradient" class="btn-pill btn-pill-ghost" style="font-size:0.75rem; height:36px;">Use Gradient</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Gradient Angle: <span id="angle-val">${m.gradientAngle}°</span></label>
                <input type="range" id="maker-angle" class="slider-range" min="0" max="360" value="${m.gradientAngle}" />
              </div>
            </div>

            <!-- 2. Network Tab -->
            <div class="tab-panel" id="tab-network" style="display:none;">
              <div class="form-group">
                <label class="form-label">Payment Network Mark</label>
                <select id="maker-network-select" class="form-input">
                  <option value="visa" ${m.network === 'visa' ? 'selected' : ''}>Visa</option>
                  <option value="mastercard" ${m.network === 'mastercard' ? 'selected' : ''}>Mastercard</option>
                  <option value="amex" ${m.network === 'amex' ? 'selected' : ''}>American Express</option>
                  <option value="jcb" ${m.network === 'jcb' ? 'selected' : ''}>JCB</option>
                  <option value="suica" ${m.network === 'suica' ? 'selected' : ''}>Suica</option>
                  <option value="applepay" ${m.network === 'applepay' ? 'selected' : ''}>Apple Pay</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Corner Position</label>
                <select id="maker-network-pos" class="form-input">
                  <option value="br" ${m.networkPos === 'br' ? 'selected' : ''}>Bottom Right (Standard)</option>
                  <option value="tr" ${m.networkPos === 'tr' ? 'selected' : ''}>Top Right</option>
                  <option value="tl" ${m.networkPos === 'tl' ? 'selected' : ''}>Top Left</option>
                  <option value="bl" ${m.networkPos === 'bl' ? 'selected' : ''}>Bottom Left</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Mark Scale: <span id="scale-val">${m.networkScale}x</span></label>
                <input type="range" id="maker-network-scale" class="slider-range" min="0.6" max="1.5" step="0.1" value="${m.networkScale}" />
              </div>
            </div>

            <!-- 3. Issuer Tab -->
            <div class="tab-panel" id="tab-issuer" style="display:none;">
              <div class="form-group">
                <label class="form-label">Bank / Issuer Wordmark</label>
                <input type="text" id="maker-issuer-name" class="form-input" value="${m.issuerName}" placeholder="e.g. CHASE, APPLE CARD, REVOLUT" />
              </div>

              <div class="form-group">
                <label class="form-label">Card Tier</label>
                <select id="maker-tier-select" class="form-input">
                  <option value="PLATINUM" ${m.tier === 'PLATINUM' ? 'selected' : ''}>PLATINUM</option>
                  <option value="INFINITE" ${m.tier === 'INFINITE' ? 'selected' : ''}>INFINITE</option>
                  <option value="WORLD ELITE" ${m.tier === 'WORLD ELITE' ? 'selected' : ''}>WORLD ELITE</option>
                  <option value="CENTURION" ${m.tier === 'CENTURION' ? 'selected' : ''}>CENTURION</option>
                  <option value="COMMUTER PASS" ${m.tier === 'COMMUTER PASS' ? 'selected' : ''}>COMMUTER PASS</option>
                  <option value="" ${m.tier === '' ? 'selected' : ''}>None</option>
                </select>
              </div>
            </div>

            <!-- 4. Details Tab -->
            <div class="tab-panel" id="tab-elements" style="display:none;">
              <div class="form-group" style="flex-direction:row; align-items:center; justify-content:space-between;">
                <label class="form-label" style="margin:0;">EMV Contact Chip</label>
                <input type="checkbox" id="maker-chip-toggle" ${m.showChip ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent);" />
              </div>

              <div class="form-group" style="flex-direction:row; align-items:center; justify-content:space-between;">
                <label class="form-label" style="margin:0;">NFC Wave Indicator</label>
                <input type="checkbox" id="maker-nfc-toggle" ${m.showNfc ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent);" />
              </div>

              <div class="form-group">
                <label class="form-label">Cardholder Name</label>
                <input type="text" id="maker-cardholder-name" class="form-input" value="${m.cardholderName}" />
              </div>

              <div class="form-group">
                <label class="form-label">Virtual Card Number</label>
                <input type="text" id="maker-card-number" class="form-input" value="${m.cardNumber}" />
              </div>

              <div class="form-group">
                <label class="form-label">Expiry (MM/YY)</label>
                <input type="text" id="maker-expiry" class="form-input" value="${m.expiry}" />
              </div>
            </div>

            <!-- 5. Finishes Tab -->
            <div class="tab-panel" id="tab-finishes" style="display:none;">
              <div class="form-group">
                <label class="form-label">Surface Finish</label>
                <select id="maker-finish-select" class="form-input">
                  <option value="sheen" ${m.finish === 'sheen' ? 'selected' : ''}>Gloss Sheen</option>
                  <option value="holo" ${m.finish === 'holo' ? 'selected' : ''}>Holographic Rainbow Foil</option>
                  <option value="matte" ${m.finish === 'matte' ? 'selected' : ''}>Frosted Matte</option>
                  <option value="none" ${m.finish === 'none' ? 'selected' : ''}>None (Pure Flat)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Finish Intensity: <span id="finish-intensity-val">${Math.round(m.finishIntensity * 100)}%</span></label>
                <input type="range" id="maker-finish-intensity" class="slider-range" min="0" max="1" step="0.05" value="${m.finishIntensity}" />
              </div>

              <div class="form-group" style="flex-direction:row; align-items:center; justify-content:space-between; margin-top:0.5rem;">
                <label class="form-label" style="margin:0;">3D Gyro / Mouse Tilt</label>
                <input type="checkbox" id="maker-tilt-toggle" ${m.tilt3D ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--accent);" />
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Interactive Canvas Stage -->
        <main class="maker-stage">
          <div class="stage-card-wrapper" id="maker-stage-wrapper">
            <div class="preview-card" id="studio-preview-card">
              <!-- Background layer -->
              <div class="preview-card-bg" id="studio-bg" style="${m.bgType === 'image' ? `background-image: url('${m.bgImage}')` : `background: linear-gradient(${m.gradientAngle}deg, ${m.bgColor1}, ${m.bgColor2})`}"></div>
              
              <!-- Finish layer -->
              <div class="preview-card-overlay" id="studio-finish" style="${m.finish === 'holo' ? 'background: linear-gradient(135deg, rgba(255,180,200,0.25), rgba(180,255,220,0.3), rgba(180,220,255,0.35));' : m.finish === 'sheen' ? `background: linear-gradient(115deg, rgba(255,255,255,${m.finishIntensity * 0.4}) 0%, transparent 60%);` : ''}"></div>

              <!-- Issuer & Tier -->
              <div class="preview-issuer" id="studio-issuer">${m.issuerName}</div>
              <div class="preview-tier" id="studio-tier">${m.tier}</div>

              <!-- Chip & NFC -->
              ${m.showChip ? `<div class="preview-chip" id="studio-chip">${EMV_CHIP}</div>` : ''}
              ${m.showNfc ? `<div class="preview-nfc" id="studio-nfc">${NFC_WAVE}</div>` : ''}

              <!-- Number & Holder -->
              <div class="preview-cardholder" id="studio-cardholder">${m.cardholderName}</div>
              <div class="preview-expiry" id="studio-expiry">VALID THRU ${m.expiry}</div>

              <!-- Network Logo -->
              <div class="preview-network-container" id="studio-network" style="transform: scale(${m.networkScale});">
                ${NETWORK_LOGOS[m.network] || NETWORK_LOGOS.visa}
              </div>
            </div>
          </div>

          <div class="stage-toolbar">
            <button id="btn-export-canvas" class="btn-pill btn-pill-solid" style="height:44px; padding:0 22px;">
              ${ICONS.download}
              <span>Download 1536×969 PNG</span>
            </button>
            <button id="btn-copy-card" class="btn-pill btn-pill-ghost" style="height:44px;">
              ${ICONS.copy}
              <span>Copy Image</span>
            </button>
            <button id="btn-randomize-maker" class="btn-pill btn-pill-ghost" style="height:44px;">
              ${ICONS.sparkles}
              <span>Surprise Me</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  `;
}

// 5. Guides Page (/guide)
function renderGuidesPage() {
  return `
    <div class="container-page guides-page">
      <div class="guide-hero">
        <h1 class="hero-title" style="font-size:2.5rem; margin-bottom:1rem;">How to put custom card art in Apple&nbsp;Wallet</h1>
        <p class="hero-desc" style="max-width:100%;">Detailed step-by-step instructions to change the face of your payment, transit, or loyalty cards on iPhone and Apple Watch.</p>
      </div>

      <div class="guide-tabs">
        <button class="guide-tab-btn active" data-guide="shortcuts">Method 1: Apple Shortcuts (No PC)</button>
        <button class="guide-tab-btn" data-guide="aircard">Method 2: AirCard App (Direct)</button>
        <button class="guide-tab-btn" data-guide="passkit">Method 3: PassKit & Custom Passes</button>
      </div>

      <div class="guide-steps-grid" id="guide-steps-container">
        <div class="guide-step-card">
          <div class="step-num">1</div>
          <h3 class="step-title">Download High-Res Card Art</h3>
          <p class="step-desc">Pick any card art on Carder or design your own in our Make Studio. Download the crystal-clear PNG to your iPhone Photos library.</p>
        </div>

        <div class="guide-step-card">
          <div class="step-num">2</div>
          <h3 class="step-title">Create Wallet Automation</h3>
          <p class="step-desc">Open the Shortcuts app on iOS > Tap Automation > Add New Automation > Choose "When Apple Pay transaction occurs" or "When Wallet opens".</p>
        </div>

        <div class="guide-step-card">
          <div class="step-num">3</div>
          <h3 class="step-title">Show Custom Wallpaper</h3>
          <p class="step-desc">Add action: "Show Photo in AirCard" or "Set Lock Screen Wallpaper". Your iPhone will instantly display your customized card art seamlessly!</p>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <div style="margin-top: 4rem; max-width: 800px; margin-left: auto; margin-right: auto;">
        <h2 style="font-size: 1.5rem; font-weight:700; margin-bottom: 1.5rem; color:var(--ink);">Frequently Asked Questions</h2>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div style="background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:1.25rem;">
            <h4 style="font-weight:600; color:var(--ink); margin-bottom:0.4rem;">Will changing card art affect Apple Pay security or contactless payments?</h4>
            <p style="font-size:0.875rem; color:var(--ink-3); line-height:1.5;">Not at all! Custom card images are purely visual presentation overlays. The underlying Device Account Number (DAN), tokenized NFC chips, and biometric Face ID security remain 100% untouched.</p>
          </div>
          <div style="background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:1.25rem;">
            <h4 style="font-weight:600; color:var(--ink); margin-bottom:0.4rem;">What is the exact resolution for Apple Wallet cards?</h4>
            <p style="font-size:0.875rem; color:var(--ink-3); line-height:1.5;">Apple specifies a 1.585 : 1 aspect ratio, with 1536 × 969 pixels at 3x Retina resolution, accompanied by a 4.8% corner border radius.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 6. Packs Page (/pack)
function renderPacksPage() {
  return `
    <div class="container-page packs-page">
      <div class="guide-hero">
        <h1 class="hero-title" style="font-size:2.5rem; margin-bottom:1rem;">Curated Card Packs</h1>
        <p class="hero-desc" style="max-width:100%;">Hand-picked theme collections designed to give your Apple Wallet a unified, premium look.</p>
      </div>

      <div class="packs-grid">
        ${PACKS_DATA.map(pack => `
          <div class="pack-card">
            <div class="pack-fan-preview">
              ${pack.cards.map((c, i) => `
                <div class="pack-mini-card" data-idx="${i}">
                  <img src="${c.image}" alt="${c.title}" style="width:100%; height:100%; object-fit:cover;" />
                </div>
              `).join('')}
            </div>

            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <h3 style="font-size:1.25rem; font-weight:700; color:var(--ink);">${pack.title}</h3>
                <span class="tag-badge" style="background:var(--accent-soft); color:var(--accent); font-weight:600;">${pack.count} cards</span>
              </div>
              <p style="font-size:0.875rem; color:var(--ink-3); line-height:1.5;">${pack.description}</p>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:1rem; border-top:1px solid var(--line);">
              <span style="font-size:0.8125rem; color:var(--ink-3);">Curated by <strong style="color:var(--ink);">${pack.author}</strong></span>
              <button class="btn-pill btn-pill-solid btn-download-pack" data-pack-id="${pack.id}">
                ${ICONS.download}
                <span>Download Pack</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 7. Overhang Physics Playground (/play/overhang)
function renderOverhangPlayground() {
  return `
    <div class="container-page overhang-page">
      <div class="guide-hero" style="margin-bottom:2rem;">
        <h1 class="hero-title" style="font-size:2.2rem; margin-bottom:0.75rem;">Card Overhang Physics</h1>
        <p class="hero-desc" style="max-width:100%;">Interactive physics stage. Drag and stack cards beyond the edge of the virtual table without letting them tip over!</p>
      </div>

      <div class="overhang-stage-box" id="overhang-stage">
        <div class="overhang-table-edge">
          TABLE SURFACE (SUPPORT LEDGE)
        </div>

        <!-- Draggable cards -->
        <div class="draggable-card" style="top: 80px; left: 160px; z-index: 10;" data-card-drag>
          <img src="/cards/CardArt-apple-cash-liquid-glass-DTHKHxAtyK.png" alt="Apple Cash Liquid Glass" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" />
        </div>
        <div class="draggable-card" style="top: 140px; left: 240px; z-index: 11;" data-card-drag>
          <img src="/cards/CardArt-coutts-silk-card-Rq5oKKnYQL.png" alt="Coutts Silk Card" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" />
        </div>
        <div class="draggable-card" style="top: 200px; left: 320px; z-index: 12;" data-card-drag>
          <img src="/cards/CardArt-porsche-911-gt3rs-visa-black-LrwWCqc1bh.png" alt="Porsche 911 GT3 RS" style="width:100%;height:100%;object-fit:cover;pointer-events:none;" />
        </div>
      </div>

      <div style="margin-top:1.5rem; display:flex; gap:1rem; align-items:center;">
        <button id="btn-reset-overhang" class="btn-pill btn-pill-ghost">
          ${ICONS.rotate}
          <span>Reset Cards</span>
        </button>
        <span style="font-size:0.8125rem; color:var(--ink-3);">Grab any card with your cursor to move it.</span>
      </div>
    </div>
  `;
}

// Footer
function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container-page footer-inner">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          ${ICONS.logo}
          <span style="font-weight:700; color:var(--ink);">Carder</span>
          <span class="footer-copy">• Card art for Apple Wallet, made and shared</span>
        </div>

        <div class="footer-links">
          <a href="#explore" class="footer-link">Explore</a>
          <a href="#make" class="footer-link">Make</a>
          <a href="#guide" class="footer-link">Guides</a>
          <a href="#pack" class="footer-link">Packs</a>
          <a href="#overhang" class="footer-link">Overhang</a>
        </div>
      </div>
    </footer>
  `;
}

// Card Detail Modal Component
function renderCardDetailModal() {
  const card = state.activeModalCard;
  if (!card) {
    return `<div id="card-detail-modal" class="modal-backdrop"></div>`;
  }

  const isLiked = state.likedCardIds.has(card.id);
  const cleanDesc = (card.description || card.subtitle).replace(/\.?\s*Designed specifically for Apple Wallet.*$/i, '').trim() || card.subtitle;

  return `
    <div id="card-detail-modal" class="modal-backdrop open">
      <div class="modal-panel">
        <button id="btn-close-detail-modal" class="modal-close-btn" aria-label="Close dialog">
          ${ICONS.close}
        </button>

        <div class="card-detail-content">
          <div class="detail-preview-box">
            <img src="${card.image}" alt="${card.title}" class="detail-card-img" />
          </div>

          <div class="detail-meta-box">
            <div>
              <h2 class="detail-title">${card.title}</h2>
              <p style="color:var(--ink-3); font-size:0.9375rem; margin-top:0.35rem;">${card.subtitle}</p>
            </div>

            <div class="creator-profile" style="padding:0.75rem; background:var(--sunken); border-radius:12px;">
              <div class="creator-avatar" style="background:${card.creator.avatarBg};">${card.creator.avatar}</div>
              <div class="creator-info">
                <div class="creator-name">${card.creator.name}</div>
                <div style="font-size:0.75rem; color:var(--ink-3);">${card.creator.handle}</div>
              </div>
            </div>

            <p style="font-size:0.875rem; line-height:1.6; color:var(--ink-2);">${cleanDesc}</p>

            <div class="tag-cloud">
              ${card.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:auto; padding-top:1.5rem; border-top:1px solid var(--line);">
              <div style="display:flex; gap:0.75rem;">
                <button class="btn-pill btn-pill-solid btn-modal-download" data-card-id="${card.id}" style="flex:1; height:44px;">
                  ${ICONS.download}
                  <span>Download Card PNG</span>
                </button>
                <button class="btn-pill btn-pill-ghost btn-modal-like ${isLiked ? 'liked' : ''}" data-card-id="${card.id}" style="height:44px; width:44px; padding:0; justify-content:center;">
                  ${isLiked ? ICONS.heartFilled : ICONS.heart}
                </button>
              </div>

              <div style="display:flex; gap:0.75rem;">
                <button class="btn-pill btn-pill-ghost btn-modal-copy" data-img="${card.image}" style="flex:1;">
                  ${ICONS.copy}
                  <span>Copy for AirCard</span>
                </button>
                <button class="btn-pill btn-pill-ghost btn-modal-customize" data-card-id="${card.id}" style="flex:1;">
                  ${ICONS.brush}
                  <span>Customize in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ⌘K Quick Search Modal
function renderSearchModal() {
  if (!state.isSearchOpen) return `<div id="search-modal" class="modal-backdrop"></div>`;
  
  const results = state.searchQuery ? state.cards.filter(c => 
    c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(state.searchQuery.toLowerCase()))
  ) : state.cards.slice(0, 6);

  return `
    <div id="search-modal" class="modal-backdrop open">
      <div class="modal-panel search-modal-panel">
        <div class="search-input-header">
          ${ICONS.search}
          <input type="text" id="quick-search-field" class="search-field" placeholder="Search cards, artists, tags..." value="${state.searchQuery}" autofocus />
          <kbd class="search-kbd">ESC</kbd>
        </div>

        <div class="search-results-list">
          ${results.length === 0 ? `
            <div style="padding:2rem; text-align:center; color:var(--ink-3); font-size:0.875rem;">No cards found matching "${state.searchQuery}"</div>
          ` : results.map(c => `
            <div class="search-result-item" data-card-id="${c.id}">
              <img src="${c.image}" class="search-thumb" alt="${c.title}" />
              <div style="flex:1; min-width:0;">
                <div style="font-weight:600; font-size:0.875rem; color:var(--ink);">${c.title}</div>
                <div style="font-size:0.75rem; color:var(--ink-3);">${c.creator.name} • ${c.tags.join(', ')}</div>
              </div>
              ${ICONS.arrowRight}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// Upload Custom Card Modal
function renderUploadModal() {
  if (!state.isUploadOpen) return `<div id="upload-modal" class="modal-backdrop"></div>`;

  return `
    <div id="upload-modal" class="modal-backdrop open">
      <div class="modal-panel" style="max-width:520px; padding:2rem;">
        <button id="btn-close-upload-modal" class="modal-close-btn" aria-label="Close dialog">
          ${ICONS.close}
        </button>

        <h2 style="font-size:1.35rem; font-weight:700; color:var(--ink); margin-bottom:0.5rem;">Upload Card Artwork</h2>
        <p style="font-size:0.875rem; color:var(--ink-3); margin-bottom:1.5rem;">Share your custom design with the Carder gallery community.</p>

        <div class="form-group" style="margin-bottom:1.25rem;">
          <label class="form-label">Card Image File</label>
          <input type="file" id="upload-file-input" accept="image/*" class="form-input" style="padding-top:6px;" />
        </div>

        <div class="form-group" style="margin-bottom:1.25rem;">
          <label class="form-label">Card Title</label>
          <input type="text" id="upload-title-input" class="form-input" placeholder="e.g. Cyber Tokyo Metro" />
        </div>

        <div class="form-group" style="margin-bottom:1.25rem;">
          <label class="form-label">Category</label>
          <select id="upload-category-input" class="form-input">
            <option value="minimalist">Minimalist</option>
            <option value="transit">Transit</option>
            <option value="luxury">Luxury Metal</option>
            <option value="anime">Anime & Cyber</option>
            <option value="gradient">Gradients & Holo</option>
            <option value="dark">Dark & Stealth</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom:1.5rem;">
          <label class="form-label">Tags (comma separated)</label>
          <input type="text" id="upload-tags-input" class="form-input" placeholder="Tokyo, Transit, Neon" />
        </div>

        <button id="btn-submit-upload" class="btn-pill btn-pill-solid" style="width:100%; height:44px; justify-content:center;">
          Publish to Gallery
        </button>
      </div>
    </div>
  `;
}

// Attach All Event Listeners
function attachEventListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cardart:theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
      showToast(`Switched to ${state.theme} mode`);
    });
  }

  // Header Search Button
  const searchBtn = document.getElementById('header-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      state.isSearchOpen = true;
      renderApp();
      setTimeout(() => {
        const input = document.getElementById('quick-search-field');
        if (input) input.focus();
      }, 50);
    });
  }

  // Upload Button
  const uploadBtn = document.getElementById('btn-upload');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      state.isUploadOpen = true;
      renderApp();
    });
  }

  // Hero Card Fan Click Reordering
  const fanCards = document.querySelectorAll('.fan-card');
  fanCards.forEach(cardEl => {
    cardEl.addEventListener('click', () => {
      const pos = cardEl.getAttribute('data-pos');
      if (pos === 'left') {
        const temp = state.heroCards[0];
        state.heroCards[0] = state.heroCards[1];
        state.heroCards[1] = temp;
      } else if (pos === 'right') {
        const temp = state.heroCards[2];
        state.heroCards[2] = state.heroCards[1];
        state.heroCards[1] = temp;
      }
      renderApp();
    });
  });

  // Creator Mini Card Stack Click Reordering
  const stacks = document.querySelectorAll('.card-stack');
  stacks.forEach(stack => {
    stack.addEventListener('click', (e) => {
      const creatorId = stack.getAttribute('data-creator-id');
      const creator = state.creators.find(c => c.id === creatorId);
      if (creator && creator.cards.length > 1) {
        // Rotate cards array
        const first = creator.cards.shift();
        creator.cards.push(first);
        renderApp();
      }
    });
  });

  // Follow Creator Buttons
  const followBtns = document.querySelectorAll('.follow-btn');
  followBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const creatorId = btn.getAttribute('data-creator-id');
      if (state.followingCreatorIds.has(creatorId)) {
        state.followingCreatorIds.delete(creatorId);
        showToast(`Unfollowed creator`);
      } else {
        state.followingCreatorIds.add(creatorId);
        showToast(`Following creator`);
      }
      localStorage.setItem('cardart:following', JSON.stringify([...state.followingCreatorIds]));
      renderApp();
    });
  });

  // Category Chips
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeCategory = chip.getAttribute('data-category');
      renderApp();
    });
  });

  // Gallery Sort Select
  const sortSelect = document.getElementById('gallery-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderApp();
    });
  }

  // Density Buttons
  const densityStd = document.getElementById('density-standard-btn');
  const densityLrg = document.getElementById('density-large-btn');
  if (densityStd) {
    densityStd.addEventListener('click', () => {
      state.density = 'standard';
      localStorage.setItem('cardart:density', 'standard');
      renderApp();
    });
  }
  if (densityLrg) {
    densityLrg.addEventListener('click', () => {
      state.density = 'large';
      localStorage.setItem('cardart:density', 'large');
      renderApp();
    });
  }

  // Card Mouse Parallax Sheen on Gallery Items
  const mediaWrappers = document.querySelectorAll('.card-media-wrapper');
  mediaWrappers.forEach(wrap => {
    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      wrap.style.setProperty('--mouse-x', `${x}%`);
      wrap.style.setProperty('--mouse-y', `${y}%`);
    });

    wrap.addEventListener('click', () => {
      const cardId = wrap.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (card) {
        state.activeModalCard = card;
        renderApp();
      }
    });
  });

  // Card Title Click -> Modal
  const titles = document.querySelectorAll('.card-title');
  titles.forEach(t => {
    t.addEventListener('click', () => {
      const cardId = t.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (card) {
        state.activeModalCard = card;
        renderApp();
      }
    });
  });

  // Like Buttons
  const likeBtns = document.querySelectorAll('.btn-like');
  likeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (!card) return;

      if (state.likedCardIds.has(cardId)) {
        state.likedCardIds.delete(cardId);
        card.likes -= 1;
        showToast('Removed from favorites');
      } else {
        state.likedCardIds.add(cardId);
        card.likes += 1;
        showToast('Added to favorites', ICONS.heartFilled);
      }
      localStorage.setItem('cardart:likes', JSON.stringify([...state.likedCardIds]));
      renderApp();
    });
  });

  // Quick Download Button on Cards
  const downloadBtns = document.querySelectorAll('.btn-quick-download');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (card) downloadCardImage(card);
    });
  });

  // Modal Actions
  const modalClose = document.getElementById('btn-close-detail-modal');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      state.activeModalCard = null;
      renderApp();
    });
  }

  const modalDownload = document.querySelector('.btn-modal-download');
  if (modalDownload) {
    modalDownload.addEventListener('click', () => {
      const cardId = modalDownload.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (card) downloadCardImage(card);
    });
  }

  const modalCopy = document.querySelector('.btn-modal-copy');
  if (modalCopy) {
    modalCopy.addEventListener('click', () => {
      const src = modalCopy.getAttribute('data-img');
      navigator.clipboard.writeText(window.location.origin + src);
      showToast('Image URL copied for AirCard!');
    });
  }

  const modalCustomize = document.querySelector('.btn-modal-customize');
  if (modalCustomize) {
    modalCustomize.addEventListener('click', () => {
      const cardId = modalCustomize.getAttribute('data-card-id');
      const card = state.cards.find(c => c.id === cardId);
      if (card) {
        state.maker.bgImage = card.image;
        state.maker.issuerName = card.title.toUpperCase();
        state.activeModalCard = null;
        window.location.hash = '#make';
      }
    });
  }

  // Quick Search Dialog Keypress & Filter
  const quickSearch = document.getElementById('quick-search-field');
  if (quickSearch) {
    quickSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      const list = document.querySelector('.search-results-list');
      if (list) {
        const results = state.searchQuery ? state.cards.filter(c => 
          c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          c.tags.some(t => t.toLowerCase().includes(state.searchQuery.toLowerCase()))
        ) : state.cards.slice(0, 6);

        list.innerHTML = results.map(c => `
          <div class="search-result-item" data-card-id="${c.id}">
            <img src="${c.image}" class="search-thumb" alt="${c.title}" />
            <div style="flex:1; min-width:0;">
              <div style="font-weight:600; font-size:0.875rem; color:var(--ink);">${c.title}</div>
              <div style="font-size:0.75rem; color:var(--ink-3);">${c.creator.name} • ${c.tags.join(', ')}</div>
            </div>
            ${ICONS.arrowRight}
          </div>
        `).join('');

        // Reattach item click
        list.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const cardId = item.getAttribute('data-card-id');
            const card = state.cards.find(c => c.id === cardId);
            if (card) {
              state.isSearchOpen = false;
              state.activeModalCard = card;
              renderApp();
            }
          });
        });
      }
    });
  }

  // Close Modals on Backdrop Click
  const modals = document.querySelectorAll('.modal-backdrop');
  modals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        state.activeModalCard = null;
        state.isSearchOpen = false;
        state.isUploadOpen = false;
        renderApp();
      }
    });
  });

  // Upload Form Handlers
  const uploadClose = document.getElementById('btn-close-upload-modal');
  if (uploadClose) {
    uploadClose.addEventListener('click', () => {
      state.isUploadOpen = false;
      renderApp();
    });
  }

  const uploadSubmit = document.getElementById('btn-submit-upload');
  if (uploadSubmit) {
    uploadSubmit.addEventListener('click', () => {
      const fileInput = document.getElementById('upload-file-input');
      const titleInput = document.getElementById('upload-title-input');
      const catInput = document.getElementById('upload-category-input');
      const tagsInput = document.getElementById('upload-tags-input');

      const title = titleInput.value.trim() || 'Custom Card Art';
      const cat = catInput.value;
      const tags = tagsInput.value ? tagsInput.value.split(',').map(s => s.trim()) : ['Custom', 'User'];

      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newCard = {
            id: 'custom-' + Date.now(),
            title: title,
            subtitle: 'Custom user creation',
            creator: {
              name: 'You',
              handle: '@creator',
              avatar: 'Y',
              avatarBg: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
              followers: 1
            },
            image: e.target.result,
            dominantColor: '#3b82f6',
            accentColor: '#3b82f6',
            category: cat,
            tags: tags,
            network: 'visa',
            likes: 1,
            downloads: 0,
            featured: false,
            description: 'Custom uploaded card artwork.'
          };

          state.cards.unshift(newCard);
          state.isUploadOpen = false;
          showToast('Card published to gallery!');
          renderApp();
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        showToast('Please select an image file first.');
      }
    });
  }

  // Card Maker Controls
  attachMakerControls();

  // Overhang Playground Drag Handlers
  attachOverhangDraggables();
}

// Card Maker Interactive Handlers
function attachMakerControls() {
  if (state.currentRoute !== '#make') return;

  // Tab switching
  const tabs = document.querySelectorAll('.maker-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');

      document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      const target = document.getElementById(`tab-${tabName}`);
      if (target) target.style.display = 'block';
    });
  });

  // Presets click
  const presets = document.querySelectorAll('.preset-thumbnail');
  presets.forEach(p => {
    p.addEventListener('click', () => {
      const src = p.getAttribute('data-preset-img');
      state.maker.bgType = 'image';
      state.maker.bgImage = src;
      updateStudioPreview();
      presets.forEach(pr => pr.classList.remove('active'));
      p.classList.add('active');
    });
  });

  // File dropzone
  const dropzone = document.getElementById('maker-file-dropzone');
  const fileInput = document.getElementById('maker-file-input');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.maker.bgType = 'image';
          state.maker.bgImage = ev.target.result;
          updateStudioPreview();
          showToast('Custom image loaded');
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // Gradient inputs
  const col1 = document.getElementById('maker-color1');
  const col2 = document.getElementById('maker-color2');
  const angle = document.getElementById('maker-angle');
  const applyGrad = document.getElementById('btn-apply-gradient');

  if (applyGrad && col1 && col2) {
    applyGrad.addEventListener('click', () => {
      state.maker.bgType = 'gradient';
      state.maker.bgColor1 = col1.value;
      state.maker.bgColor2 = col2.value;
      updateStudioPreview();
      showToast('Gradient applied');
    });
  }

  if (angle) {
    angle.addEventListener('input', (e) => {
      state.maker.gradientAngle = e.target.value;
      const val = document.getElementById('angle-val');
      if (val) val.textContent = `${e.target.value}°`;
      if (state.maker.bgType === 'gradient') updateStudioPreview();
    });
  }

  // Network Select & Scale
  const netSelect = document.getElementById('maker-network-select');
  if (netSelect) {
    netSelect.addEventListener('change', (e) => {
      state.maker.network = e.target.value;
      updateStudioPreview();
    });
  }

  const netScale = document.getElementById('maker-network-scale');
  if (netScale) {
    netScale.addEventListener('input', (e) => {
      state.maker.networkScale = parseFloat(e.target.value);
      const val = document.getElementById('scale-val');
      if (val) val.textContent = `${e.target.value}x`;
      updateStudioPreview();
    });
  }

  // Issuer & Tier Text
  const issuerInput = document.getElementById('maker-issuer-name');
  if (issuerInput) {
    issuerInput.addEventListener('input', (e) => {
      state.maker.issuerName = e.target.value;
      const el = document.getElementById('studio-issuer');
      if (el) el.textContent = e.target.value;
    });
  }

  const tierSelect = document.getElementById('maker-tier-select');
  if (tierSelect) {
    tierSelect.addEventListener('change', (e) => {
      state.maker.tier = e.target.value;
      const el = document.getElementById('studio-tier');
      if (el) el.textContent = e.target.value;
    });
  }

  // Chip & NFC Toggles
  const chipToggle = document.getElementById('maker-chip-toggle');
  if (chipToggle) {
    chipToggle.addEventListener('change', (e) => {
      state.maker.showChip = e.target.checked;
      updateStudioPreview();
    });
  }

  const nfcToggle = document.getElementById('maker-nfc-toggle');
  if (nfcToggle) {
    nfcToggle.addEventListener('change', (e) => {
      state.maker.showNfc = e.target.checked;
      updateStudioPreview();
    });
  }

  // Cardholder & Number
  const holderInput = document.getElementById('maker-cardholder-name');
  if (holderInput) {
    holderInput.addEventListener('input', (e) => {
      state.maker.cardholderName = e.target.value;
      const el = document.getElementById('studio-cardholder');
      if (el) el.textContent = e.target.value;
    });
  }

  const expiryInput = document.getElementById('maker-expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      state.maker.expiry = e.target.value;
      const el = document.getElementById('studio-expiry');
      if (el) el.textContent = `VALID THRU ${e.target.value}`;
    });
  }

  // Finishes
  const finishSelect = document.getElementById('maker-finish-select');
  if (finishSelect) {
    finishSelect.addEventListener('change', (e) => {
      state.maker.finish = e.target.value;
      updateStudioPreview();
    });
  }

  const finishIntensity = document.getElementById('maker-finish-intensity');
  if (finishIntensity) {
    finishIntensity.addEventListener('input', (e) => {
      state.maker.finishIntensity = parseFloat(e.target.value);
      const val = document.getElementById('finish-intensity-val');
      if (val) val.textContent = `${Math.round(e.target.value * 100)}%`;
      updateStudioPreview();
    });
  }

  // 3D Parallax Tilt on Preview Card
  const stageWrapper = document.getElementById('maker-stage-wrapper');
  const previewCard = document.getElementById('studio-preview-card');
  if (stageWrapper && previewCard) {
    stageWrapper.addEventListener('mousemove', (e) => {
      if (!state.maker.tilt3D) return;
      const rect = stageWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = -(y / (rect.height / 2)) * 14;
      const rotY = (x / (rect.width / 2)) * 14;
      previewCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    stageWrapper.addEventListener('mouseleave', () => {
      previewCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  }

  // Export 1536x969 Canvas Button
  const exportBtn = document.getElementById('btn-export-canvas');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      showToast('Rendering Apple Wallet card...');
      try {
        const canvas = await renderCardToCanvas(state.maker);
        const link = document.createElement('a');
        link.download = `Carder-${state.maker.issuerName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Card downloaded successfully!');
      } catch (err) {
        console.error(err);
        showToast('Export failed. Please try again.');
      }
    });
  }

  // Copy Image Button
  const copyBtn = document.getElementById('btn-copy-card');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const canvas = await renderCardToCanvas(state.maker);
        canvas.toBlob(async (blob) => {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Image copied to clipboard!');
        });
      } catch (err) {
        showToast('Image copied!');
      }
    });
  }

  // Surprise Me / Randomize
  const randomBtn = document.getElementById('btn-randomize-maker');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomCard = CARDS_DATA[Math.floor(Math.random() * CARDS_DATA.length)];
      state.maker.bgType = 'image';
      state.maker.bgImage = randomCard.image;
      state.maker.issuerName = randomCard.title.toUpperCase();
      state.maker.network = randomCard.network;
      updateStudioPreview();
      showToast(`Loaded ${randomCard.title}!`);
    });
  }
}

// Update DOM elements inside the Studio Preview Card
function updateStudioPreview() {
  const m = state.maker;
  const bg = document.getElementById('studio-bg');
  const finish = document.getElementById('studio-finish');
  const net = document.getElementById('studio-network');
  const chip = document.getElementById('studio-chip');
  const nfc = document.getElementById('studio-nfc');

  if (bg) {
    if (m.bgType === 'image') {
      bg.style.background = `url('${m.bgImage}') center/cover no-repeat`;
    } else {
      bg.style.background = `linear-gradient(${m.gradientAngle}deg, ${m.bgColor1}, ${m.bgColor2})`;
    }
  }

  if (finish) {
    if (m.finish === 'holo') {
      finish.style.background = 'linear-gradient(135deg, rgba(255,180,200,0.25), rgba(180,255,220,0.3), rgba(180,220,255,0.35))';
    } else if (m.finish === 'sheen') {
      finish.style.background = `linear-gradient(115deg, rgba(255,255,255,${m.finishIntensity * 0.4}) 0%, transparent 60%)`;
    } else if (m.finish === 'matte') {
      finish.style.background = `rgba(255,255,255,${m.finishIntensity * 0.12})`;
    } else {
      finish.style.background = 'none';
    }
  }

  if (net) {
    net.innerHTML = NETWORK_LOGOS[m.network] || NETWORK_LOGOS.visa;
    net.style.transform = `scale(${m.networkScale})`;
  }

  const wrapper = document.getElementById('studio-preview-card');
  if (wrapper) {
    if (m.showChip && !chip) {
      const chipEl = document.createElement('div');
      chipEl.id = 'studio-chip';
      chipEl.className = 'preview-chip';
      chipEl.innerHTML = EMV_CHIP;
      wrapper.appendChild(chipEl);
    } else if (!m.showChip && chip) {
      chip.remove();
    }

    if (m.showNfc && !nfc) {
      const nfcEl = document.createElement('div');
      nfcEl.id = 'studio-nfc';
      nfcEl.className = 'preview-nfc';
      nfcEl.innerHTML = NFC_WAVE;
      wrapper.appendChild(nfcEl);
    } else if (!m.showNfc && nfc) {
      nfc.remove();
    }
  }
}

// Download Card File Utility
async function downloadCardImage(card) {
  showToast(`Downloading "${card.title}" (1536×969)...`);
  try {
    const canvas = await renderCardToCanvas({
      bgType: 'image',
      bgImage: card.image,
      issuerName: card.title.toUpperCase(),
      network: card.network || 'visa',
      cardholderName: card.creator.name.toUpperCase(),
      finish: 'sheen',
      finishIntensity: 0.35
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${card.title.replace(/\s+/g, '_')}-AppleWallet.png`;
    a.click();
    showToast('Download complete!');
  } catch (err) {
    // Direct link fallback
    const a = document.createElement('a');
    a.href = card.image;
    a.download = `${card.id}.png`;
    a.click();
  }
}

// Overhang Playground Draggables
function attachOverhangDraggables() {
  const draggables = document.querySelectorAll('[data-card-drag]');
  draggables.forEach(card => {
    let isDragging = false;
    let startX, startY, origX, origY;

    card.addEventListener('pointerdown', (e) => {
      isDragging = true;
      card.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      origX = card.offsetLeft;
      origY = card.offsetTop;
      card.style.zIndex = '50';
    });

    card.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      card.style.left = `${origX + dx}px`;
      card.style.top = `${origY + dy}px`;
    });

    card.addEventListener('pointerup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      card.releasePointerCapture(e.pointerId);
      card.style.zIndex = '15';

      // Check if pushed too far over the edge
      const stage = document.getElementById('overhang-stage');
      if (stage) {
        const stageW = stage.clientWidth;
        if (card.offsetLeft > stageW * 0.65) {
          card.style.transition = 'transform 0.4s ease, opacity 0.4s';
          card.style.transform = 'rotate(45deg) translateY(120px)';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'none';
            card.style.transform = 'none';
            card.style.opacity = '1';
            card.style.left = '160px';
            card.style.top = '120px';
            showToast('Card tipped over the ledge! Reset to table.');
          }, 600);
        }
      }
    });
  });

  const resetBtn = document.getElementById('btn-reset-overhang');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      draggables.forEach((c, idx) => {
        c.style.left = `${160 + idx * 80}px`;
        c.style.top = `${80 + idx * 60}px`;
        c.style.transform = 'none';
        c.style.opacity = '1';
      });
      showToast('Cards reset on table');
    });
  }
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    state.isSearchOpen = !state.isSearchOpen;
    renderApp();
    if (state.isSearchOpen) {
      setTimeout(() => {
        const input = document.getElementById('quick-search-field');
        if (input) input.focus();
      }, 50);
    }
  }

  if (e.key === 'Escape') {
    if (state.isSearchOpen || state.activeModalCard || state.isUploadOpen) {
      state.isSearchOpen = false;
      state.activeModalCard = null;
      state.isUploadOpen = false;
      renderApp();
    }
  }
});

// Boot the application
handleRouting();
