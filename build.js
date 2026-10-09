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
const content = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(fs.readFileSync(path.join(__dirname, 'content', `${l}.json`), 'utf8'))]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Universal numbering across the upper arch, as in the app. The preview shows
// teeth 3-14 (wisdom teeth and second molars left out so the teeth can be larger).
const TOOTH_SCALE = { molar: 2.5, premolar: 2.2, canine: 2.15, incisor: 1.9 };
function toothType(n) {
  const p = n <= 8 ? n : 17 - n;
  if (p <= 3) return 'molar';
  if (p <= 5) return 'premolar';
  if (p === 6) return 'canine';
  return 'incisor';
}
const CROWN = 'M16 9.6C14.6 8.4 13.2 7.8 11.6 7.8 8.9 7.8 7.2 9.9 7.2 12.8c0 2.4 1 4.1 1.6 6.4.6 2.4.9 5.4 2.6 5.4 1.6 0 1.7-2.7 2.3-4.3.4-1 1.2-1.5 2.3-1.5s1.9.5 2.3 1.5c.6 1.6.7 4.3 2.3 4.3 1.7 0 2-3 2.6-5.4.6-2.3 1.6-4 1.6-6.4 0-2.9-1.7-5-4.4-5-1.6 0-3 .6-4.4 1.8z';

function chartSvg(c) {
  const step = 44;
  const first = 3;
  const last = 14;
  let teeth = '';
  for (let n = first; n <= last; n++) {
    const s = TOOTH_SCALE[toothType(n)];
    const cx = (n - first) * step + step / 2;
    const x = cx - 16 * s; // the glyph's centre is x=16 in the 32-unit icon box
    const base = 66;
    const y = base - 24.6 * s;
    const label = c.widget.tooth.replace('{n}', n);
    teeth += `<g class="tooth" data-n="${n}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(label)}">`
      + `<rect class="hit" x="${cx - step / 2}" y="0" width="${step}" height="94"/>`
      + `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s})"><path class="crown" d="${CROWN}"/></g>`
      + `<path class="cross" d="M${cx - 12} ${base - 30}L${cx + 12} ${base - 6}M${cx + 12} ${base - 30}L${cx - 12} ${base - 6}"/>`
      + `<text class="num" x="${cx}" y="88" text-anchor="middle">${n}</text></g>`;
  }
  return `<svg class="arch" viewBox="0 0 ${(last - first + 1) * step} 94" role="group" aria-label="${esc(c.widget.label)}">${teeth}</svg>`;
}

function page(l) {
  const c = content[l];
  const root = l === 'he' ? '' : '../';
  const url = SITE + DIRS[l];
  const alt = LANGS.map((x) => `<link rel="alternate" hreflang="${x}" href="${SITE + DIRS[x]}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${SITE}">`;
  const langLinks = LANGS.map((x) => (x === l
    ? `<a href="${root + DIRS[x]}" lang="${x}" hreflang="${x}" aria-current="true">${esc(content[x].langName)}</a>`
    : `<a href="${root + DIRS[x]}" lang="${x}" hreflang="${x}">${esc(content[x].langName)}</a>`)).join('');

  const features = c.features.items.map((i) => `<li><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const roles = c.roles.items.map((i) => `<li><h3>${esc(i.r)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const security = c.security.items.map((i) => `<li><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const steps = c.start.steps.map((i, k) => `<li><span class="step-n" aria-hidden="true">${k + 1}</span><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></li>`).join('');
  const faq = c.faq.items.map((i) => `<details><summary>${esc(i.q)}</summary><p>${esc(i.a)}</p></details>`).join('');

  const strings = JSON.stringify({ lang: c.lang, ...c.widget, contact: c.contact }).replace(/</g, '\\u003c');
  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'ClinicLine',
    applicationCategory: 'BusinessApplication', operatingSystem: 'Web browser',
    description: c.meta.description, inLanguage: ['he', 'ar', 'en'], url: SITE,
  }).replace(/</g, '\\u003c');

  return `<!doctype html>
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
  <meta name="theme-color" content="#1B366A">
  <link rel="icon" href="${root}assets/icon.svg" type="image/svg+xml">
  <link rel="preload" href="${root}assets/fonts/ibm-plex-sans-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${root}assets/fonts.css">
  <link rel="stylesheet" href="${root}assets/style.css">
  <script type="application/ld+json">${ld}</script>
</head>
<body>
  <a class="skip" href="#main">${esc(c.nav.skip)}</a>
  <header class="top">
    <div class="wrap top-row">
      <a class="brand" href="${root + DIRS[l]}"><img src="${root}assets/icon.svg" alt="" width="28" height="28"><span>ClinicLine</span></a>
      <nav class="nav" aria-label="${esc(c.nav.menu)}">
        <a href="#features">${esc(c.nav.features)}</a>
        <a href="#security">${esc(c.nav.security)}</a>
        <a href="#start">${esc(c.nav.start)}</a>
        <a href="#faq">${esc(c.nav.faq)}</a>
      </nav>
      <div class="langs" aria-label="Language">${langLinks}</div>
      <a class="btn btn-small" href="#contact">${esc(c.nav.demo)}</a>
    </div>
  </header>

  <main id="main">
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <h1>${esc(c.hero.h1)}</h1>
          <p class="lead">${esc(c.hero.sub)}</p>
          <p class="hero-actions">
            <a class="btn" href="#contact">${esc(c.hero.primary)}</a>
            <a class="btn btn-quiet" href="#features">${esc(c.hero.secondary)}</a>
          </p>
        </div>
        <div class="chart-card" id="chart" data-lang="${c.lang}">
          <p class="chart-label">${esc(c.widget.label)}</p>
          <div class="arch-wrap" dir="ltr">${chartSvg(c)}</div>
          <div class="chart-actions">
            <p class="chart-hint" aria-live="polite">${esc(c.widget.hint)}</p>
            <div class="chart-buttons">
              <button type="button" class="chip chip-caries" data-add="caries" disabled>${esc(c.widget.caries)}</button>
              <button type="button" class="chip chip-extract" data-add="extract" disabled>${esc(c.widget.extract)}</button>
            </div>
          </div>
          <div class="plan">
            <div class="plan-head"><h2>${esc(c.widget.planTitle)}</h2><button type="button" class="link" data-reset hidden>${esc(c.widget.reset)}</button></div>
            <ul class="plan-list" aria-live="polite"></ul>
            <p class="plan-empty">${esc(c.widget.empty)}</p>
          </div>
          <p class="chart-note">${esc(c.widget.note)}</p>
        </div>
      </div>
    </section>

    <section class="section" id="features">
      <div class="wrap">
        <div class="section-head"><h2>${esc(c.features.title)}</h2><p>${esc(c.features.intro)}</p></div>
        <ul class="feature-list">${features}</ul>
      </div>
    </section>

    <section class="section section-wash" id="roles">
      <div class="wrap">
        <div class="section-head"><h2>${esc(c.roles.title)}</h2></div>
        <ul class="roles">${roles}</ul>
      </div>
    </section>

    <section class="section section-deep" id="security">
      <div class="wrap">
        <div class="section-head"><h2>${esc(c.security.title)}</h2><p>${esc(c.security.intro)}</p></div>
        <ul class="feature-list feature-list-dark">${security}</ul>
      </div>
    </section>

    <section class="section" id="start">
      <div class="wrap">
        <div class="section-head"><h2>${esc(c.start.title)}</h2></div>
        <ol class="steps">${steps}</ol>
      </div>
    </section>

    <section class="section section-wash demo" id="demo">
      <div class="wrap demo-row">
        <div><h2>${esc(c.demo.title)}</h2><p>${esc(c.demo.text)}</p></div>
        <a class="btn" href="#contact">${esc(c.demo.cta)}</a>
      </div>
    </section>

    <section class="section" id="faq">
      <div class="wrap faq-wrap">
        <div class="section-head"><h2>${esc(c.faq.title)}</h2></div>
        <div class="faq">${faq}</div>
      </div>
    </section>

    <section class="section section-wash" id="contact">
      <div class="wrap contact-grid">
        <div class="section-head"><h2>${esc(c.contact.title)}</h2><p>${esc(c.contact.intro)}</p></div>
        <form class="form" id="contact-form" novalidate>
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
    <div class="wrap foot-row">
      <span>© ${new Date().getFullYear()} ${esc(c.footer.rights)}</span>
      <span>${esc(c.footer.privacy)}</span>
    </div>
  </footer>

  <script type="application/json" id="strings">${strings}</script>
  <script src="${root}assets/config.js"></script>
  <script src="${root}assets/chart.js" defer></script>
  <script src="${root}assets/form.js" defer></script>
</body>
</html>
`;
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
