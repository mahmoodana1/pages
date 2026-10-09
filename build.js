#!/usr/bin/env node
// Renders one static page per language from content/*.json.
//   node build.js
// Hebrew is the site root; English and Arabic live in /en/ and /ar/.
// Edit the words in content/, the look in assets/style.css, then run this again.

const fs = require('fs');
const path = require('path');

const SITE = 'https://mahmoodana1.github.io/pages/';
const LANGS = ['he', 'en', 'ar'];
const DIRS = { he: '', en: 'en/', ar: 'ar/' };
const SHOTS = ['patient', 'schedule', 'payments', 'types']; // assets/shots/<lang>-<name>.webp, in tour order
const SHOT_W = [768, 1536, 3072]; // widths of the shipped WebP files
const SHOT_SIZE = { patient: [1536, 1400], schedule: [1536, 1400], payments: [1536, 1400], types: [1536, 1400] };
const WM = '<span class="wm"><span class="wm-a">Clinic</span><span class="wm-b">Line</span></span>';
const LANG_FONT = { he: 'heebo', ar: 'cairo', en: 'manrope' };
const content = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(__dirname, 'content', `${l}.json`), 'utf8'))]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TOOTH = 'M16 9.6C14.6 8.4 13.2 7.8 11.6 7.8 8.9 7.8 7.2 9.9 7.2 12.8c0 2.4 1 4.1 1.6 6.4.6 2.4.9 5.4 2.6 5.4 1.6 0 1.7-2.7 2.3-4.3.4-1 1.2-1.5 2.3-1.5s1.9.5 2.3 1.5c.6 1.6.7 4.3 2.3 4.3 1.7 0 2-3 2.6-5.4.6-2.3 1.6-4 1.6-6.4 0-2.9-1.7-5-4.4-5-1.6 0-3 .6-4.4 1.8z';
const ICONS = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/>',
  tooth: `<g transform="translate(-1.2 -1.2) scale(.82)"><path d="${TOOTH}"/></g>`,
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8 12h8M8 16h5"/>',
  wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  building: '<rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6M8 7h2M8 11h2M8 15h2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  export: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.4 0 4 1.3 4 4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
};
const icon = (name, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const FEATURE_ICONS = ['calendar', 'user', 'tooth', 'clipboard', 'wallet', 'image', 'building', 'globe'];
const ROLE_ICONS = ['tooth', 'users', 'sliders'];
const SECURITY_ICONS = ['database', 'lock', 'shield', 'clock', 'key', 'export'];
const TRUST_ICONS = ['globe', 'database', 'shield', 'browser'];

const srcset = (lang, name) => SHOT_W.map((w) => `@ROOT@assets/shots/${lang}-${name}-${w}.webp ${w}w`).join(', ');

// sizes tells the browser how wide the picture really is on screen, so it fetches
// the smallest file that still looks sharp on that device.
function frame(lang, name, { eager = false, cls = '', sizes = '(min-width: 961px) 560px, calc(100vw - 40px)' } = {}) {
  const [w, h] = SHOT_SIZE[name];
  const alt = content[lang].tour.tabs[SHOTS.indexOf(name)].alt;
  return `<figure class="frame ${cls}"><div class="frame-bar" dir="ltr"><i></i><i></i><i></i><span>ClinicLine</span></div>`
    + `<img src="@ROOT@assets/shots/${lang}-${name}-1536.webp" srcset="${srcset(lang, name)}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}></figure>`;
}

function page(l) {
  const c = content[l];
  const root = l === 'he' ? '' : '../';
  const url = SITE + DIRS[l];
  const R = (html) => html.replace(/@ROOT@/g, root);
  const alt = LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE + DIRS[x]}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  const langLinks = LANGS.map((x) => (x === l
    ? `<a href="${root + DIRS[x]}" lang="${x}" hreflang="${x}" aria-current="true">${esc(content[x].langName)}</a>`
    : `<a href="${root + DIRS[x]}" lang="${x}" hreflang="${x}">${esc(content[x].langName)}</a>`)).join('');

  const card = (items, icons, cls) => items.map((i, k) => `<li class="${cls}" data-reveal style="--d:${(k % 4) * 70}ms">${icon(icons[k], 'ico ico-lg')}<h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const trust = c.trust.map((i, k) => `<li>${icon(TRUST_ICONS[k])}<div><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></div></li>`).join('');
  const features = card(c.features.items, FEATURE_ICONS, 'card');
  const roles = card(c.roles.items.map((i) => ({ t: i.r, d: i.d })), ROLE_ICONS, 'role');
  const security = card(c.security.items, SECURITY_ICONS, 'sec');
  const steps = c.start.steps.map((i, k) => `<li data-reveal style="--d:${k * 120}ms"><span class="step-n" aria-hidden="true">${k + 1}</span><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const faq = c.faq.items.map((i) => `<details><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join('');

  const tourTabs = c.tour.tabs.map((t, k) => `<button type="button" role="tab" id="tab-${k}" aria-selected="${k === 0}" aria-controls="panel-${k}" tabindex="${k === 0 ? 0 : -1}" class="tour-tab${k === 0 ? ' is-on' : ''}" data-i="${k}">`
    + `<span class="tour-tab-name">${esc(t.tab)}</span><span class="tour-tab-title">${esc(t.t)}</span>`
    + `<span class="tour-tab-more"><span class="tour-more-in"><span class="tour-d">${esc(t.d)}</span><ul>${t.points.map((p) => `<li>${icon('check', 'ico ico-sm')}<span>${esc(p)}</span></li>`).join('')}</ul></span></span>`
    + `<span class="tour-bar" aria-hidden="true"></span></button>`).join('');
  const tourPanels = SHOTS.map((n, k) => `<div role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}" class="tour-shot${k === 0 ? ' is-on' : ''}">${frame(l, n, { sizes: '(min-width: 961px) 600px, calc(100vw - 40px)' })}</div>`).join('');

  const strings = JSON.stringify({ lang: c.lang, contact: c.contact }).replace(/</g, '\\u003c');
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'ClinicLine',
    applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser',
    description: c.meta.description, inLanguage: ['he', 'ar', 'en'], url: SITE,
  }).replace(/</g, '\\u003c');

  return R(`<!doctype html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(c.meta.title)}</title>
  <meta name="description" content="${esc(c.meta.description)}">
  <link rel="canonical" href="${url}">
  ${alt}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ClinicLine">
  <meta property="og:title" content="${esc(c.meta.title)}">
  <meta property="og:description" content="${esc(c.meta.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}assets/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#152a52">
  <link rel="icon" href="@ROOT@assets/icon.svg" type="image/svg+xml">
  <link rel="preload" href="@ROOT@assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
${LANG_FONT[l] !== 'manrope' ? `  <link rel="preload" href="@ROOT@assets/fonts/${LANG_FONT[l]}.woff2" as="font" type="font/woff2" crossorigin>\n` : ''}  <link rel="preload" as="image" type="image/webp" imagesrcset="${srcset(l, 'patient')}" imagesizes="(min-width: 961px) 520px, calc(100vw - 40px)">
  <link rel="stylesheet" href="@ROOT@assets/fonts.css">
  <link rel="stylesheet" href="@ROOT@assets/style.css">
  <script>document.documentElement.classList.add('js')</script>
  <script type="application/ld+json">${ld}</script>
</head>
<body>
  <a class="skip" href="#main">${esc(c.nav.skip)}</a>
  <header class="top" id="top">
    <div class="wrap top-row">
      <a class="brand" href="@ROOT@${DIRS[l]}"><img src="@ROOT@assets/icon.svg" alt="" width="32" height="32">${WM}</a>
      <nav class="nav" aria-label="${esc(c.nav.menu)}">
        <a href="#features">${esc(c.nav.features)}</a>
        <a href="#tour">${esc(c.nav.tour)}</a>
        <a href="#security">${esc(c.nav.security)}</a>
        <a href="#start">${esc(c.nav.start)}</a>
        <a href="#faq">${esc(c.nav.faq)}</a>
      </nav>
      <div class="langs" aria-label="Language">${langLinks}</div>
      <a class="btn btn-small btn-top" href="#contact">${esc(c.nav.demo)}</a>
    </div>
  </header>

  <main id="main">
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1 class="rise" style="--d:0ms">${esc(c.hero.h1)}</h1>
          <p class="lead rise" style="--d:120ms">${esc(c.hero.sub)}</p>
          <p class="hero-actions rise" style="--d:240ms">
            <a class="btn btn-light" href="#contact">${esc(c.hero.primary)}</a>
            <a class="btn btn-ghost" href="#tour">${esc(c.hero.secondary)}</a>
          </p>
        </div>
        <div class="stage rise" style="--d:200ms" id="stage">
          ${frame(l, 'patient', { eager: true, cls: 'frame-main', sizes: '(min-width: 961px) 520px, calc(100vw - 40px)' })}
          <figure class="stat-card"><img src="@ROOT@assets/shots/${l}-card-612.webp" srcset="@ROOT@assets/shots/${l}-card-612.webp 612w, @ROOT@assets/shots/${l}-card-1224.webp 1224w" sizes="220px" width="1224" height="366" alt="${esc(c.hero.cardAlt)}" loading="lazy" decoding="async"></figure>
        </div>
      </div>
    </section>

    <section class="trust" aria-label="ClinicLine">
      <div class="wrap"><ul class="trust-list">${trust}</ul></div>
    </section>

    <section class="section" id="features">
      <div class="wrap">
        <div class="section-head" data-reveal><h2>${esc(c.features.title)}</h2><p>${esc(c.features.intro)}</p></div>
        <ul class="cards">${features}</ul>
      </div>
    </section>

    <section class="section section-wash" id="tour">
      <div class="wrap">
        <div class="section-head" data-reveal><h2>${esc(c.tour.title)}</h2><p>${esc(c.tour.intro)}</p></div>
        <div class="tour" id="tour-ui" data-reveal>
          <div class="tour-tabs" role="tablist" aria-orientation="vertical">${tourTabs}</div>
          <div class="tour-stage">${tourPanels}</div>
        </div>
      </div>
    </section>

    <section class="section" id="roles">
      <div class="wrap">
        <div class="section-head" data-reveal><h2>${esc(c.roles.title)}</h2></div>
        <ul class="roles">${roles}</ul>
      </div>
    </section>

    <section class="section section-deep" id="security">
      <div class="wrap">
        <div class="section-head" data-reveal><h2>${esc(c.security.title)}</h2><p>${esc(c.security.intro)}</p></div>
        <ul class="secs">${security}</ul>
      </div>
    </section>

    <section class="section" id="start">
      <div class="wrap">
        <div class="section-head" data-reveal><h2>${esc(c.start.title)}</h2></div>
        <ol class="steps" id="steps">${steps}</ol>
      </div>
    </section>

    <section class="demo" id="demo">
      <div class="wrap demo-grid">
        <div data-reveal><h2>${esc(c.demo.title)}</h2><p>${esc(c.demo.text)}</p><p><a class="btn btn-light" href="#contact">${esc(c.demo.cta)}</a></p></div>
        <div class="demo-peek" data-reveal style="--d:120ms">${frame(l, 'types')}</div>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="wrap faq-wrap">
        <div class="section-head" data-reveal><h2>${esc(c.faq.title)}</h2></div>
        <div class="faq" data-reveal>${faq}</div>
      </div>
    </section>

    <section class="section section-wash" id="contact">
      <div class="wrap contact-grid">
        <div class="section-head" data-reveal><h2>${esc(c.contact.title)}</h2><p>${esc(c.contact.intro)}</p></div>
        <form class="form" id="contact-form" novalidate data-reveal style="--d:100ms">
          <label>${esc(c.contact.name)}<input name="name" autocomplete="name" required></label>
          <label>${esc(c.contact.clinic)}<input name="clinic" autocomplete="organization"></label>
          <label>${esc(c.contact.reach)}<input name="reach" autocomplete="email" required></label>
          <label>${esc(c.contact.message)}<textarea name="message" rows="4"></textarea></label>
          <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn" type="submit">${esc(c.contact.send)}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
  </main>

  <footer class="foot">
    <div class="wrap foot-grid">
      <div class="foot-brand"><a class="brand" href="@ROOT@${DIRS[l]}"><img src="@ROOT@assets/icon.svg" alt="" width="32" height="32">${WM}</a><p>${esc(c.footer.tagline)}</p></div>
      <nav class="foot-nav" aria-label="${esc(c.nav.menu)}">
        <a href="#features">${esc(c.nav.features)}</a><a href="#tour">${esc(c.nav.tour)}</a><a href="#security">${esc(c.nav.security)}</a><a href="#faq">${esc(c.nav.faq)}</a><a href="#contact">${esc(c.nav.demo)}</a>
      </nav>
      <div class="foot-langs">${langLinks}</div>
    </div>
    <div class="wrap foot-row"><span>© ${new Date().getFullYear()} ${esc(c.footer.rights)}</span><span>${esc(c.footer.privacy)}</span></div>
  </footer>

  <script type="application/json" id="strings">${strings}</script>
  <script src="@ROOT@assets/config.js"></script>
  <script src="@ROOT@assets/app.js" defer></script>
  <script src="@ROOT@assets/form.js" defer></script>
</body>
</html>
`);
}

for (const l of LANGS) {
  const dir = path.join(__dirname, DIRS[l]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(l));
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`
  + LANGS.map((l) => `  <url><loc>${SITE + DIRS[l]}</loc><lastmod>${today}</lastmod>`
    + LANGS.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE + DIRS[x]}"/>`).join('') + `</url>`).join('\n')
  + `\n</urlset>\n`);
fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('built', LANGS.map((l) => DIRS[l] + 'index.html').join(', '));
