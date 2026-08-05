# pinme-web

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

## Deploying to Cloudflare

Cloudflare now deploys this as a **Workers static-assets** project (`npx wrangler
deploy`), not classic Pages. Two consequences worth knowing:

- The assets directory is the repo root, so **every file in the repo is served
  publicly** unless listed in `.assetsignore`. Without it, `/.git/config` and
  the entire commit history are downloadable. Add anything non-site there.
- `_redirects` may only contain relative URLs — see the www note below.

`wrangler.jsonc` pins the settings so a build never re-runs auto-detection.

## Deploying to Cloudflare Pages (classic)

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, and pick this repo.
3. Build settings: leave the build command **empty** and set the output
   directory to `/`. There is nothing to compile.
4. Deploy. Every push to `main` republishes.
5. **Custom domains** → add the domain, and Cloudflare wires up DNS and TLS.

`_headers` is applied automatically by Cloudflare Pages (and by Netlify, which
uses the same format). `.html` extensions are stripped automatically, so
`/privacy` and `/support` work without any redirect rules.

The apex is canonical, so `www.pin-me.dk` needs to 301 to `pin-me.dk`. That
**cannot** live in a `_redirects` file here: Cloudflare's asset deployer rejects
absolute URLs (`Only relative URLs are allowed`, code 100324), and a relative
rule can't match on hostname. Use a dashboard **Redirect Rule** on the zone
instead — see the README section below.

### www → apex redirect rule

Cloudflare dashboard → `pin-me.dk` → Rules → Redirect Rules → Create rule:

- **If**: Hostname equals `www.pin-me.dk`
- **Then**: Dynamic redirect, 301, expression
  `concat("https://pin-me.dk", http.request.uri.path)`
- Preserve query string: on

## Before this goes live

| What | Where | Currently |
|---|---|---|
| Domain | `<link rel="canonical">` and `og:url` in each page, plus `robots.txt` and `sitemap.xml` | `https://pin-me.dk` |
| Contact address | `CONTACT_EMAIL` in `assets/site.js`, and the `mailto:` links in each footer | `pinme.dk@gmail.com` |
| Email signup backend | `NOTIFY_ENDPOINT` in `assets/site.js` | empty — still a placeholder, see below |

### The notify-me form

The design mock showed “You're on the list ✓” with nothing behind it. Shipping
that as-is would tell people they had subscribed while the address went
nowhere, so the form has two honest modes:

- **`NOTIFY_ENDPOINT` empty** (current): submitting opens the visitor's mail
  client with a pre-filled message. Nothing is collected by the page, and the
  address only reaches you if they press send.
- **`NOTIFY_ENDPOINT` set**: the address is `POST`ed as JSON (`{"email": "…"}`)
  to that URL, and the success state becomes truthful. Works with Formspree,
  Buttondown, ConvertKit, or a Cloudflare Worker.

If you set an endpoint on a different origin, add it to a `connect-src`
directive in `_headers` — the CSP is `default-src 'self'` and will otherwise
block the request.

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
