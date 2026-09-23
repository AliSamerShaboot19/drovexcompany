# drovex — bilingual website + admin terminal

React 18 · Vite · Three.js · Framer Motion · Supabase. English (LTR) and Arabic (RTL) with a live language switcher.

## Setup

1. **Database** — Supabase Dashboard → SQL Editor → paste `supabase/schema.sql` → Run.
2. **Environment** — copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` to your project URL
   (`https://<project-ref>.supabase.co`, from Project Settings → API). The publishable key is already filled in.
3. **Run**
   ```bash
   npm install
   npm run dev      # http://localhost:5173
   npm run build    # production build in dist/
   ```
4. **Admin** — open `/admin` and enter the passphrase set in `schema.sql` (`drovex2026`).

## How admin security works

The publishable key is public (it ships in the JS bundle), so the tables are read-only for it (Row Level Security).
All writes go through four Postgres functions (`admin_save_project`, `admin_delete_project`,
`admin_update_social`, `admin_verify`) that check the passphrase against a bcrypt hash server-side.
The passphrase is **not** in the front-end code. To change it, see the comment in `schema.sql` section 3.

## Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo (or run `vercel` from this folder with the [Vercel CLI](https://vercel.com/docs/cli)).
2. In the Vercel dashboard: **Add New → Project**, import the repo. Vercel auto-detects Vite — build command
   `npm run build`, output directory `dist`. `vercel.json` is already set up so `/admin` doesn't 404 on refresh.
3. Under **Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your publishable key
   (Set them for Production, Preview and Development.)
4. Deploy. Every push to your main branch redeploys automatically; every PR gets its own preview URL.
5. Custom domain: **Settings → Domains** → add it and follow the DNS instructions Vercel shows.

Netlify (`public/_redirects`) is also pre-configured for the `/admin` route if you'd rather use that instead.

## Buying a domain & connecting it

1. **Buy the domain.** Any registrar works with Vercel — Namecheap, Cloudflare Registrar (sold at cost, no
   markup) and Google Domains successor Squarespace Domains are common picks. A `.com` for a normal word is
   usually $10–15/year; avoid registrars that show a low first-year price then jump on renewal.
2. **Attach it in Vercel.** Project → **Settings → Domains** → add `drovex.com` (and `www.drovex.com`, then
   pick one as the redirect target — Vercel offers to set that up automatically).
3. **DNS.** Vercel shows you exactly what to add at your registrar:
   - Apex domain (`drovex.com`): an **A** record to Vercel's IP (`76.76.21.21`), or an **ALIAS/ANAME** if your
     registrar supports it.
   - `www.drovex.com`: a **CNAME** to `cname.vercel-dns.com`.
   - Or, simplest: change the domain's nameservers to Vercel's and let it manage all the DNS records for you.
4. DNS propagation is usually minutes, sometimes up to ~24h. Vercel issues a free SSL certificate automatically
   once it verifies the domain — no separate step needed.
5. Once the domain is live, **find-and-replace `SITE_URL`** with it (no `https://`, no trailing slash) across:
   `index.html`, `public/robots.txt`, `public/sitemap.xml`.

## SEO

- **Meta tags** — `index.html` has a title, meta description, canonical URL, Open Graph and Twitter Card tags,
  and an `Organization` JSON-LD block. A generated 1200×630 share image is at `public/og-image.jpg` — swap it
  for a designed one whenever you have one (real product screenshot, or your tagline set in type).
- **robots.txt / sitemap.xml** — in `public/`. `/admin` is excluded from both since it's a private dashboard,
  not public content. Add more `<url>` entries to the sitemap if you add more pages later.
- **Search Console** — after the domain is live: [Google Search Console](https://search.google.com/search-console)
  → Add property → verify (the easiest method here is the **DNS** one, adding a TXT record at your registrar) →
  submit `https://yourdomain.com/sitemap.xml` under Sitemaps. Do the same at
  [Bing Webmaster Tools](https://www.bing.com/webmasters) (it can also just import from Search Console).
- **One real limitation to know about:** this is a client-rendered React app with **one URL that toggles
  between English and Arabic in the browser** (not two separate pages). Google can generally execute the JS
  and index the page, but it will only ever see and rank *one* language version at that URL — normally
  whichever is set in `index.html` (English, currently). Social-preview crawlers (Facebook, Telegram, X) don't
  run JS at all, so they always see the English `<meta>` tags in `index.html`, regardless of what a visitor
  last switched to in their own browser. The `<noscript>` block in `index.html` gives non-JS crawlers a
  minimal fallback in the meantime.
  If ranking well in Arabic search specifically matters, the fix is giving Arabic its own URL (e.g.
  `/ar/...`) with its own pre-rendered `<title>`/meta tags — a bigger change to the routing than this pass,
  happy to build it if you want it.

## Performance

- The public site's JS never includes `three.js` or the admin dashboard: both are separate chunks loaded
  only when actually needed (the 3D logo, or a visit to `/admin`), so first load stays light.
- Below-the-fold sections use `content-visibility: auto` so the browser skips layout/paint work for
  content that isn't on screen yet.
- The background aura blobs and the 3D logo pause their render loop when the tab isn't visible, and use
  a lighter blur/pixel ratio on small screens.
- Logo images used at icon size (navbar, admin bar, footer) are served as separate, smaller files
  (`logo-*-sm.jpg`) rather than the full-resolution originals.
- Run `npm run build` then `npx vite preview` to test the production bundle locally, or check
  [PageSpeed Insights](https://pagespeed.web.dev/) / Lighthouse against the deployed Vercel URL.

## Structure

```
src/
  i18n/          translations.js (EN/AR strings + team data), LanguageContext.jsx (dir/lang switching)
  context/       DataContext.jsx (Supabase fetch + realtime), ToastContext.jsx
  components/    Navbar, Preloader, AuraBackground, Logo3D (the drovex mark in Three.js), Tilt, Reveal, Icons
  sections/      Hero, Marquee, Services (bento), Process, Team, Portfolio, Socials, Footer
  pages/         Home.jsx, Admin.jsx
  lib/           supabase.js, utils.js
  styles/        index.css
supabase/schema.sql
```
