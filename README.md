# ClinicLine site

The public website for ClinicLine, dental clinic software for Hebrew, Arabic and English clinics.
Live at https://mahmoodana1.github.io/pages/ (Hebrew), `/en/` and `/ar/`.

Plain HTML, CSS and a little JavaScript. No tracking, no cookies, and the fonts are hosted here: Manrope (Latin, including the ClinicLine wordmark), Heebo (Hebrew) and Cairo (Arabic).

## Wording

The Hebrew and Arabic text addresses the reader in the plural ("you" as a team) and prefers neutral or passive phrasing over gendered verb forms. Where a person noun is needed it is either collective (the team, the management, reception) or lists both (doctors, men and women). Keep to that when editing `content/he.json` and `content/ar.json`.

## Edit the words

All text is in `content/he.json`, `content/en.json` and `content/ar.json`. Change it, then run:

```
node build.js
```

That rewrites `index.html`, `en/index.html`, `ar/index.html` and `sitemap.xml`. Commit and push, and GitHub Pages updates within a minute or two.

The look is `assets/style.css`; the behaviour (header, scroll reveals, product tour, hero card) is `assets/app.js`.

## The screenshots

`assets/shots/<lang>-<screen>-<width>.webp` are real screens from ClinicLine with a fictional demo clinic (all patient and staff names made up, and male). Each screen ships in three widths (768, 1536 and 3072 pixels) and the page lets each device pick the one it needs, so phones and standard screens stay fast and sharp screens get the full detail.

They are captured from the app's working area at a 1040px-wide window with the browser's pixel density set to 4x, which is why the text stays crisp. To retake them: seed a demo clinic (`scripts/demo-tenant.js` in the clinic repo), capture the screens in each language, then for each one write the three widths with `magick in.png -resize 3072x -quality 82 -define webp:method=6 out-3072.webp` (and again for 1536 and 768). The site shows no photographs of people.

## Contact form

The form posts to https://formsubmit.co, which emails the address in `assets/config.js` (`mail`). No popups, no email app. The first message ever sent makes FormSubmit email that address an activation link; click it once and every later message arrives as a normal email.

## Other things worth doing

- Add a custom domain: Settings → Pages → Custom domain, then change `SITE` at the top of `build.js` and rebuild.
- Replace `assets/og.png` (the image shown when the link is shared) by editing `assets/og.svg` and running `rsvg-convert -w 1200 assets/og.svg -o assets/og.png`.
