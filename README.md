# ClinicLine site

The public website for ClinicLine, dental clinic software for Hebrew, Arabic and English clinics.
Live at https://mahmoodana1.github.io/pages/ (Hebrew), `/en/` and `/ar/`.

Plain HTML, CSS and a little JavaScript. No tracking, no cookies, and the fonts are hosted here.

## Edit the words

All text is in `content/he.json`, `content/en.json` and `content/ar.json`. Change it, then run:

```
node build.js
```

That rewrites `index.html`, `en/index.html`, `ar/index.html` and `sitemap.xml`. Commit and push, and GitHub Pages updates within a minute or two.

The look is `assets/style.css`. The hero tooth chart is `assets/chart.js`.

## Make the contact form send to you

Until you do this, the form opens the visitor's email app with the message ready.

1. Sign up at https://formspree.io and create a form that sends to your email.
2. Copy the id from its URL (`https://formspree.io/f/<id>`).
3. Put it in `assets/config.js` as `formspreeId`, commit and push.

## Other things worth doing

- Add a custom domain: Settings → Pages → Custom domain, then change `SITE` at the top of `build.js` and rebuild.
- Replace `assets/og.png` (the image shown when the link is shared) by editing `assets/og.svg` and running `rsvg-convert -w 1200 assets/og.svg -o assets/og.png`.
