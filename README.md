# [pinme-web](https://pin-me.dk/)

Marketing site for **Pin Me** — the location-reminder app in the
`location_reminder` repo.

Static HTML, CSS and one small JS file. **No build step, no dependencies, no
`node_modules`.** What is in the repo is exactly what gets served.

## Local preview

Any static file server works:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Fonts

Nunito is **self-hosted**, not loaded from Google Fonts — for a site whose
pitch is privacy, sending every visitor's IP to Google's CDN would undercut the
argument, and it drops a render-blocking third-party request.

The four weights were subset from the TTFs in the app repo's
`@expo-google-fonts/nunito` to Latin + punctuation, and come to ~13 KB each.
To regenerate one (needs `pip install fonttools brotli`):

```bash
pyftsubset Nunito_900Black.ttf --output-file=assets/fonts/nunito-900.woff2 --flavor=woff2 --layout-features='kern,liga,calt' --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
```

Nunito is licensed under the SIL Open Font License 1.1.

## Design notes

The visual language is shared with the app ("Citrus"), and two rules carry over:

- **Never rely on synthesised font weight.** Each Nunito weight is its own file
  and its own `@font-face`.
- **`#FF9500` is a fill colour only.** Orange text and icons use `#B05A00`; the
  bright orange only reaches about 2.0:1 against the cream background, far
  below WCAG AA.

The source design lives in the Claude Design project "Pin Me — Landing". That
export is a canvas preview (it pulls in a React runtime, `support.js`, and uses
`{{ }}` template bindings) — it is a mock, not shippable markup, so this site is
a hand-built translation of it rather than a copy.

## Files

```
index.html        landing page
privacy.html      privacy policy — required by App Store Connect
support.html      support / FAQ — required by App Store Connect
404.html
_headers          security headers + font caching (Cloudflare Pages / Netlify)
robots.txt
sitemap.xml
assets/
  styles.css
  site.js         notify-me form + footer year
  favicon.svg
  apple-touch-icon.png
  fonts/          nunito-600/700/800/900.woff2
```
