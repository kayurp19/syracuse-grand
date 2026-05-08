# Syracuse Grand — Website

A modern, fast, static website for Syracuse Grand (Liverpool, NY).
HTML + CSS + a tiny bit of JavaScript. Served by Caddy from a small Docker image. Deployable to Railway in a few minutes.

---

## Going live on syracusegrand.com — step by step

These are the exact steps to replace the current L.E.T.-hosted site with this one. Plan ~30 minutes total. DNS propagation can take a few hours afterward.

### Step 1 — Push this code to GitHub (5 min)

If you don't already have a GitHub repo for this site:

1. Go to [github.com/new](https://github.com/new)
2. Name the repo something like `syracuse-grand-website` (private is fine).
3. **Don't** initialize with a README — we already have one.
4. On your computer, in the unzipped project folder:

```bash
git init
git add .
git commit -m "Initial Syracuse Grand website"
git branch -M main
git remote add origin https://github.com/<your-username>/syracuse-grand-website.git
git push -u origin main
```

If GitHub asks for credentials, use a [personal access token](https://github.com/settings/tokens) instead of your password.

### Step 2 — Deploy to Railway (10 min)

1. Go to [railway.com](https://railway.com) and sign in (you mentioned you have an account already).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Pick your `syracuse-grand-website` repo.
4. Railway auto-detects the `Dockerfile` and `railway.json`, builds the Caddy image, and starts the site.
5. After ~2 minutes, click the deployment to get a temporary Railway URL like `syracuse-grand-website-production.up.railway.app`. Visit it to confirm everything looks right.

### Step 3 — Point syracusegrand.com to Railway (10 min)

1. In Railway → your service → **Settings** → **Networking** → **Custom Domain**.
2. Add **two** custom domains:
   - `www.syracusegrand.com` (the canonical / primary)
   - `syracusegrand.com` (the apex / root — Railway will auto-redirect to www)
3. Railway will display DNS records. They'll look like:
   - For `www.syracusegrand.com`: a **CNAME** record pointing to a `*.up.railway.app` host.
   - For `syracusegrand.com`: an **A** record (or ALIAS/ANAME if your registrar supports it) pointing to a Railway IP.
4. Log in to your domain registrar (wherever syracusegrand.com is registered — likely GoDaddy, Namecheap, Squarespace Domains, or similar).
5. Find the **DNS settings** for syracusegrand.com.
6. **Before changing anything, screenshot the current records** in case you need to roll back to L.E.T.
7. Update the DNS to match exactly what Railway showed you. Delete or replace the records currently pointing to L.E.T.'s servers.
8. Save. DNS propagation typically takes 15 minutes to 4 hours; sometimes up to 24 hours.

### Step 4 — Verify (5 min, after DNS propagates)

- Visit [https://www.syracusegrand.com](https://www.syracusegrand.com) — should load this new site.
- Visit [https://syracusegrand.com](https://syracusegrand.com) — should redirect to www.
- Check HTTPS — Railway issues a free SSL certificate automatically (Let's Encrypt). The padlock icon should appear within a few minutes of DNS propagating.
- Test "Book Now" buttons — they should open Vertical Booking.

### Step 5 — Submit to search engines (5 min)

After the site is live at the real domain:

1. **Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)
   - Add property: `https://www.syracusegrand.com`
   - Verify (Google usually offers a DNS TXT record method — easy if you just did DNS)
   - Once verified, go to **Sitemaps** → submit `https://www.syracusegrand.com/sitemap.xml`
2. **Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters)
   - Same idea. Bing also powers Yahoo, DuckDuckGo, ChatGPT search, and Apple Spotlight.
3. **Google Business Profile** — [business.google.com](https://business.google.com)
   - Make sure the website URL on your profile is `https://www.syracusegrand.com`.
   - Send me the GBP URL so I can add it to the site's structured data — this links the two and helps with local search.

---

## How to make content changes later

All content lives in plain HTML files at the project root. Open them in any text editor (VS Code is great and free).

### Common edits

**Change the booking link, phone number, address, or nav menu:**
Edit `includes.js` (top of the file). One change updates every page.

**Change room descriptions or photos:**
Edit `rooms.html`. Photos live in `assets/images/`.

**Change the home-page hero text:**
Edit `index.html` near the top, in the `<section class="hero">` block.

**Add a new blog post:**
Copy one of the files in `blog/` (e.g. `blog/where-to-eat-liverpool-ny.html`), give it a new filename, and edit the title, date, image, and body. Then add a new card to `blog/index.html` and a new `<url>` entry to `sitemap.xml`.

**Change the look (colors, fonts, spacing):**
Edit `style.css`. The design tokens (colors, fonts) are at the very top.

### Push your changes live

```bash
git add .
git commit -m "Updated room photos"
git push
```

Railway watches GitHub and redeploys automatically within ~1 minute.

---

## Project structure

```
syracuse-grand/
├── index.html              Home page
├── rooms.html              Rooms & suites
├── amenities.html          Amenities
├── meetings.html           Meeting space
├── groups.html             Group rates
├── local-area.html         Local area
├── contact.html            Contact + FAQ
├── blog/
│   ├── index.html          Blog index
│   ├── *.html              Individual posts
│   ├── blog.css            Blog-only styles
│   └── blog-includes.js    Header/footer for blog (parent paths)
├── style.css               Main design system + page styles
├── app.js                  Scroll header, mobile menu, animations
├── includes.js             Shared header/footer/mobile-bar (root pages)
├── sitemap.xml             SEO sitemap
├── robots.txt              Search engine crawl rules
├── assets/images/          All photos and logos
├── Dockerfile              Tiny Caddy static-server image
├── Caddyfile               Caddy routing + cache + security headers
└── railway.json            Railway build/deploy config
```

---

## Local preview (optional, for testing changes)

If you want to preview changes on your laptop before pushing:

```bash
# From the project root, any one of these works:
python3 -m http.server 8080
# or
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Booking link

The Vertical Booking link is in `includes.js` at the top:

```js
const BOOKING_URL = "https://reservations.verticalbooking.com/premium/index.html?id_albergo=29493&dc=3887&lingua_int=usa&id_stile=22079";
```

If your booking system ever changes, edit this one line and every "Book Now" button across the site updates automatically.

---

## Need to roll back to L.E.T.?

If anything goes wrong during DNS cutover:
1. Go back to your domain registrar's DNS settings.
2. Restore the records from your screenshot.
3. DNS will revert within a few hours.

The Railway deployment doesn't affect L.E.T.'s servers — they keep running until DNS no longer points to them.
