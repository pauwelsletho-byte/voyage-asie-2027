// Petites illustrations en SVG (légères, fonctionnent hors ligne)

// Paysage karstique avec soleil, pitons et barque : bandeau du haut
export function landscape(id = "ls") {
  return `<svg class="landscape" viewBox="0 0 400 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
  <defs>
    <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>
    <linearGradient id="${id}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sea1)"/><stop offset="1" stop-color="var(--sea2)"/></linearGradient>
  </defs>
  <rect width="400" height="150" fill="url(#${id}sky)"/>
  <circle cx="300" cy="46" r="22" fill="var(--sun)"/>
  <circle cx="300" cy="46" r="32" fill="var(--sun)" opacity=".18"/>
  <path d="M0 112 L0 86 Q14 50 28 60 Q34 30 46 34 Q56 40 60 70 Q70 52 80 66 L92 112Z" fill="var(--hill3)"/>
  <path d="M150 112 Q160 40 176 26 Q186 22 192 40 Q198 70 206 62 Q214 46 224 52 Q232 64 236 112Z" fill="var(--hill3)"/>
  <path d="M60 112 Q72 66 90 56 Q100 52 106 70 Q110 86 118 80 Q128 64 140 74 L150 112Z" fill="var(--hill2)"/>
  <path d="M250 112 Q262 58 276 54 Q288 54 292 78 Q300 66 312 70 Q322 50 336 46 Q350 46 356 72 Q366 62 380 70 L400 80 L400 112Z" fill="var(--hill2)"/>
  <path d="M196 112 Q206 74 222 70 Q234 70 240 90 L250 112Z" fill="var(--hill1)"/>
  <rect y="110" width="400" height="40" fill="url(#${id}sea)"/>
  <path d="M40 124h50M150 132h70M260 122h40M310 138h60" stroke="var(--wave)" stroke-width="2" stroke-linecap="round"/>
  <g transform="translate(118 116)"><path d="M0 8 Q22 16 44 8 L40 4 L4 4Z" fill="var(--boat)"/><path d="M20 4 L20 -16 L34 2Z" fill="var(--sail)"/><line x1="20" y1="4" x2="20" y2="-17" stroke="var(--boat)" stroke-width="1.5"/></g>
</svg>`;
}

// Motif par pays, en coin des fiches d'étape
export const MOTIFS = {
  hk: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M4 60V40h6v-8h5v28h3V22h7v38h3V30h4l3-10 3 10h4v30h3V36h6v-6h5v30z"/></svg>`,
  cn: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M6 60c3-14 4-30 9-36 3-4 6 2 6 10 1-10 4-22 9-26 4-3 7 6 7 18 2-6 5-10 8-8 4 3 5 22 7 42zM2 60h60v2H2z"/></svg>`,
  vn: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><rect x="30" y="2" width="4" height="8" rx="1"/><path d="M20 12h24l-2 4c6 4 8 10 8 16s-2 12-8 16l2 4H20l2-4c-6-4-8-10-8-16s2-12 8-16z"/><rect x="26" y="54" width="12" height="3" rx="1"/><path d="M28 57h2v6h-2zm6 0h2v6h-2z"/></g></svg>`,
  kh: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 4l4 10h-2l3 8h-2l3 10h3l-2-6 4-8 4 8-2 6h3l2 8H8l2-8h3l-2-6 4-8 4 8-2 6h3l3-10h-2l3-8h-2zM6 42h52v4H6zm-2 6h56v12H4z"/></svg>`,
  my: `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><path d="M33 60c0-16 1-28 4-38l2 1c-3 10-4 22-4 37z"/><path d="M38 22c-8-6-18-6-26 0 8-2 16-1 22 3zM38 22c4-9 13-14 22-12-8 2-15 7-18 14zM38 22c9-3 18 0 24 8-8-5-16-6-22-4zM38 22c-3-8-11-14-20-14 8 3 13 8 16 15z"/><path d="M0 58q8-4 16 0t16 0 16 0 16 0v6H0z"/></g></svg>`,
  fr: "",
};

// Icônes des outils
export const TOOL_ICONS = {
  conv: '<path d="M7 7h11l-3-3 1.4-1.4L22.8 9l-6.4 6.4L15 14l3-3H7zm10 10H6l3 3-1.4 1.4L1.2 15l6.4-6.4L9 10l-3 3h11z"/>',
  phrases: '<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 5v2h10V9zm0 4v2h7v-2z"/>',
  vault: '<path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10z"/>',
  prep: '<path d="M19 3h-4.2A3 3 0 0 0 12 1a3 3 0 0 0-2.8 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 14-4-4 1.4-1.4 2.6 2.6 6.6-6.6L18 9z"/>',
  settings: '<path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7 7 0 0 0-1.7-1L15 3h-4l-.4 2.9a7 7 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7 7 0 0 0 1.7 1L11 21h4l.4-2.9a7 7 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>',
  food: '<path d="M2 11h20a10 10 0 0 1-6 9.2V22H8v-1.8A10 10 0 0 1 2 11zm5-9 1.4 1.4C7.6 4.2 7.6 5 8.3 5.8c1.5 1.5 1.5 3.6.2 5.2H6.4c1-1 1-2.2.4-3.1C5.5 6.3 5.7 3.3 7 2zm5 0 1.4 1.4c-.8.8-.8 1.6-.1 2.4 1.5 1.5 1.5 3.6.2 5.2h-2.1c1-1 1-2.2.4-3.1-1.3-1.6-1.1-4.6.2-5.9z"/>',
  tips: '<path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2zM9 20h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/>',
  stats: '<path d="M4 20h4V10H4zm6 0h4V4h-4zm6 0h4v-7h-4z"/>',
  journal: '<path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h8V6zm0 4v2h8v-2zm0 4v2h5v-2z"/>',
  remind: '<path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/>',
  pin: '<path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>',
  play: '<path d="M3 9v6h4l5 5V4L7 9zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/>',
};
