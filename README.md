# Carder — Apple Wallet Card Art Gallery & Maker Studio

<div align="center">
  <h3>Card art for Apple Wallet, made and <em>shared</em></h3>
  <p>Pick one you love, or make your own, and put it directly in your Apple Wallet.</p>
</div>

---

## 🌟 Overview

**Carder** is a web gallery and interactive creation studio for Apple Wallet card art. Personalize your digital wallet with pixel-perfect card graphics, transit passes, anime artwork, luxury metallic textures, and minimalist aesthetics.

Every card face is engineered specifically to the Apple Wallet standard aspect ratio (**1536 × 969 px**, 1.585 : 1) with matching **4.8%** corner curvature.

---

## 🚀 Key Features

### 1. 3D Interactive Hero Card Fan
- **3D Perspective Staging**: Layered card fan featuring *Coutts Silk Private Banking*, *Apple Cash Liquid Glass*, and *Porsche 911 GT3 RS*.
- **Interactive Reordering**: Click any background card to smoothly bring it forward with fluid spring easing.
- **Dynamic Colored Glow**: Ambient backdrop illumination dynamically morphs to match the dominant color palette of the active card.

### 2. Comprehensive 51-Card Gallery
- 51 high-resolution card artworks:
  - **Luxury Metal**: *Coutts Silk Private Banking*, *Coutts Silk 2026*, *Robinhood Solid Gold*, *Porsche 911 GT3 RS*, *Mercedes AMG Key Card*, *Amex Platinum Scrooge McDuck*, *Brushed Titanium V8*.
  - **Pop & Memes**: *Fry: Shut Up & Take My Money!*, *UNO Reverse Card Red*, *GTA VI Vice City*, *Commonbroke Bank*, *Memerican Express*, *The Dark Knight Batman Card*.
  - **Apple Ecosystem & Liquid Glass**: *Apple Cash Liquid Glass*, *Apple Liquid Glass Prism*, *Apple Black Stealth Visa*, *Apple Card Minimalist White*, *Apple Pay Classic*.
  - **Anime & Gaming**: *Akatsuki Cloud*, *Chiikawa Kawaii Pass*, *Snoopy & Woodstock*, *Mario Kart Rainbow Road*.
  - **Transit & Metro**: *Suica Tokyo Commuter Pass*, *ICOCA Kansai JR Transit Pass*, *Shinjuku Midnight Neon*.
  - **Fintech & Web3**: *Revolut Matte Black*, *Revolut Aurora Iridescent*, *Wise Multi-Currency Platinum*, *Phantom Solana*, *Palantir Foundry Pay*, *Starbucks Reserve Emerald*.
- **Multi-Category Filter Chips**: Instant category filtering without emoji clutter.
- **View Density Switcher**: Toggle between compact 3-column and expanded 2-column grid layouts.
- **Sorting**: Filter by *Trending*, *Most Liked*, and *Newest*.
- **Interactive Favorites**: Heart cards to save them locally.

### 3. In-Browser Card Maker Studio (`#make`)
- **Real-Time 3D Tilt Preview**: Real-time cursor gyro simulation with specular light highlights.
- **Artwork & Backgrounds**:
  - Drag-and-drop custom image upload with instant canvas rendering.
  - Quick preset library loaded with popular card designs.
  - Dual-color gradient builder with customizable angle dial (0°–360°).
- **Payment Network Marks**: Authentic vector logos for **Visa**, **Mastercard**, **American Express**, **JCB**, **Suica**, and **Apple Pay** with corner placement and scale sliders.
- **Card Hardware Elements**: Toggleable EMV smart contact chip (gold/silver) and contactless NFC waves.
- **Surface Finishes**: Gloss sheen, holographic rainbow foil, and frosted matte overlays with intensity control.
- **Instant Export**: Renders and downloads high-resolution **1536 × 969 PNG** files using HTML5 Canvas.

### 4. Apple Wallet Installation Guides (`#guide`)
- Step-by-step visual tutorials for:
  - **Method 1**: Apple Shortcuts Automation (100% native iOS, no computer required).
  - **Method 2**: AirCard App (one-tap direct card face replacement).
  - **Method 3**: PassKit and custom `.pkpass` bundles.
- FAQ covering Apple Pay security, NFC tokenization, and resolution specs.

### 5. Curated Card Packs (`#pack`)
- Curated collections (*Royal Private Wealth & Silk*, *Motorsport & High Performance*, *Viral Internet & Culture Legends*, *Apple Liquid Glass & Prisms*) with fanned preview stacks.

### 6. Overhang Physics Playground (`#play/overhang`)
- Interactive canvas demonstrating card overhang physics—drag, stack, and balance cards over the virtual table ledge.

### 7. Utilities & Polish
- **Command Palette (`⌘K` / `Ctrl+K`)**: Fast instant search matching card titles, tags, and artists.
- **Theme Toggle**: Seamless dark mode and light mode transitions with localStorage persistence.
- **Borderless Card Modal**: Clean presentation with no outer card-in-card containers.
- **Community Upload**: Add and preview your own designs directly in the gallery.

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5, JavaScript (ES Modules)
- **Styling**: Vanilla CSS (Custom Design System, CSS Variables, Glassmorphism, 3D Transforms)
- **Bundler & Dev Server**: [Vite](https://vite.dev/)
- **Graphics**: HTML5 Canvas 2D Context (1536 × 969 export engine), Inline SVGs
- **Typography**: Plus Jakarta Sans, Great Vibes (Google Fonts)

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `pnpm` / `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sadewasadewal/Carder.git
   cd Carder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### Building for Production

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 📱 How to Use Cards in Apple Wallet

1. Pick or make a card in **Carder** and download the PNG.
2. Open the **Shortcuts** app on iOS.
3. Tap **Automation** > **New Automation** > select **When Apple Pay Transaction Occurs** or **When Wallet Opens**.
4. Choose **Set Wallpaper / Show Photo in AirCard** and select your downloaded card image.
5. Your custom card art will appear seamlessly whenever you use Apple Pay!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
