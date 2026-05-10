/**
 * Syracuse Grand — production server.
 *
 * Serves the static site (replaces Caddy) and exposes a single API endpoint:
 *   POST /api/contact   — sends form submissions to SMTP_TO via SMTP.
 *
 * Required env vars (set in Railway → Variables):
 *   SMTP_HOST       e.g. smtp.office365.com   (or smtp.gmail.com, etc.)
 *   SMTP_PORT       e.g. 587
 *   SMTP_USER       e.g. hotel@syracusegrand.com
 *   SMTP_PASS       SMTP password / app password
 *   SMTP_FROM       e.g. "Syracuse Grand <hotel@syracusegrand.com>"
 *   SMTP_TO         e.g. sales@syracusegrand.com (auto-forwards to sales@sundhm.com)
 *   SMTP_SECURE     "true" for port 465, otherwise "false" (STARTTLS on 587)
 *
 * Optional:
 *   PORT            Defaults to 8080 (Railway sets this automatically)
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.disable('x-powered-by');
app.set('trust proxy', 1);

/* ---------- Security & cache headers (parity with old Caddyfile) ---------- */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

/* ---------- JSON body parsing for the API ---------- */
app.use('/api', express.json({ limit: '32kb' }));

/* ---------- Tiny in-memory rate limit (per-IP, sliding window) ---------- */
const RATE = { windowMs: 10 * 60 * 1000, max: 5, hits: new Map() };
function rateLimit(req, res, next) {
  const ip = (req.ip || req.headers['x-forwarded-for'] || 'unknown').toString().split(',')[0].trim();
  const now = Date.now();
  const arr = (RATE.hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  if (arr.length >= RATE.max) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }
  arr.push(now);
  RATE.hits.set(ip, arr);
  // periodic cleanup
  if (RATE.hits.size > 5000) RATE.hits.clear();
  next();
}

/* ---------- Resend HTTPS API (preferred — Railway blocks outbound SMTP) ----------
   Set RESEND_API_KEY to send via HTTPS POST to api.resend.com instead of SMTP.
   Falls back to nodemailer/SMTP if RESEND_API_KEY isn't set.
*/
function usingResendApi() {
  return !!process.env.RESEND_API_KEY;
}
async function sendViaResend({ from, to, replyTo, subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  };
  if (replyTo) payload.reply_to = replyTo;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await r.text();
  let json = null;
  try { json = JSON.parse(bodyText); } catch (_) {}

  if (!r.ok) {
    const err = new Error(`Resend API ${r.status}: ${(json && json.message) || bodyText.slice(0, 200)}`);
    err.code = 'RESEND_API_ERROR';
    err.status = r.status;
    err.responseBody = json || bodyText;
    throw err;
  }
  return json;
}

/* ---------- SMTP transporter (lazy) ---------- */
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    // Fail fast instead of hanging forever if the SMTP host is unreachable.
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    requireTLS: String(process.env.SMTP_REQUIRE_TLS || 'false').toLowerCase() === 'true',
    tls: { servername: process.env.SMTP_HOST },
  });
  return _transporter;
}

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function clean(v, max = 2000) {
  if (v == null) return '';
  return String(v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

/* ---------- Health check ---------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, smtpConfigured: !!getTransporter() });
});

/* ---------- SMTP verify (diagnostic) ----------
   Hit /api/smtp-verify?key=<DIAG_KEY> to verify SMTP connectivity & auth.
   Set DIAG_KEY env var to enable. Returns nodemailer's verify() result.
*/
app.get('/api/smtp-verify', async (req, res) => {
  const key = process.env.DIAG_KEY;
  if (!key || req.query.key !== key) return res.status(404).json({ ok: false });

  // If using Resend HTTPS API, ping their /domains endpoint to verify the API key works.
  if (usingResendApi()) {
    try {
      const r = await fetch('https://api.resend.com/domains', {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      });
      const body = await r.text();
      let json = null; try { json = JSON.parse(body); } catch (_) {}
      return res.json({
        ok: r.ok,
        mode: 'resend-https-api',
        status: r.status,
        from: process.env.SMTP_FROM || null,
        to: process.env.SMTP_TO || null,
        response: json || body.slice(0, 300),
      });
    } catch (err) {
      return res.json({ ok: false, mode: 'resend-https-api', error: err.message });
    }
  }

  const t = getTransporter();
  if (!t) return res.json({ ok: false, error: 'SMTP not configured' });
  try {
    const ok = await t.verify();
    res.json({
      ok,
      mode: 'smtp',
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM || null,
      to: process.env.SMTP_TO || null,
    });
  } catch (err) {
    res.json({
      ok: false,
      mode: 'smtp',
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
      message: err.message,
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
    });
  }
});

/* ---------- POST /api/contact ---------- */
app.post('/api/contact', rateLimit, async (req, res) => {
  try {
    const body = req.body || {};

    // Honeypot — bots fill hidden field. Accept both old & new field names.
    const hpValue = clean(body.sg_hp_token) || clean(body.company_website);
    if (hpValue) {
      console.warn('contact form honeypot triggered:', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        sg_hp_token: clean(body.sg_hp_token).slice(0, 60),
        company_website: clean(body.company_website).slice(0, 60),
        name: clean(body.name).slice(0, 40),
        email: clean(body.email).slice(0, 60),
      });
      return res.json({ ok: true }); // silent success
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 200);
    const phone = clean(body.phone, 60);
    const subject = clean(body.subject, 120) || 'Website inquiry';
    const message = clean(body.message, 5000);
    const checkin = clean(body.checkin, 40);
    const checkout = clean(body.checkout, 40);
    const guests = clean(body.guests, 20);

    // Basic validation
    if (!name || name.length < 2) {
      return res.status(400).json({ ok: false, error: 'Please tell us your name.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (!message || message.length < 5) {
      return res.status(400).json({ ok: false, error: 'Please include a short message.' });
    }

    if (!usingResendApi()) {
      const transporter = getTransporter();
      if (!transporter) {
        console.error('Email service not configured — set RESEND_API_KEY (preferred) or SMTP_* env vars on Railway.');
        return res.status(503).json({ ok: false, error: 'Email service is not configured. Please call (315) 701-4400.' });
      }
    }

    const to = process.env.SMTP_TO || 'sales@syracusegrand.com';
    const from = process.env.SMTP_FROM || `"Syracuse Grand Website" <${process.env.SMTP_USER}>`;
    const ip = (req.ip || '').toString();

    const text = [
      `New inquiry from syracusegrand.com`,
      ``,
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone || '-'}`,
      `Subject:  ${subject}`,
      checkin || checkout || guests ? `\nStay details:` : ``,
      checkin ? `  Check-in:  ${checkin}` : ``,
      checkout ? `  Check-out: ${checkout}` : ``,
      guests ? `  Guests:    ${guests}` : ``,
      ``,
      `Message:`,
      message,
      ``,
      `---`,
      `Submitted: ${new Date().toISOString()}`,
      `IP:        ${ip}`,
    ].filter(Boolean).join('\n');

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1d2540;max-width:640px">
        <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#1d2540">New inquiry from syracusegrand.com</h2>
        <p style="margin:0 0 18px;color:#6b7080;font-size:13px">Submitted ${escapeHtml(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))} ET</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;width:130px;color:#6b7080">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee"><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee"><a href="mailto:${escapeHtml(email)}" style="color:#b08940">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee"><a href="tel:${escapeHtml(phone)}" style="color:#b08940">${escapeHtml(phone)}</a></td></tr>` : ''}
          <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Subject</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(subject)}</td></tr>
          ${checkin ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Check-in</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(checkin)}</td></tr>` : ''}
          ${checkout ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Check-out</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(checkout)}</td></tr>` : ''}
          ${guests ? `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#6b7080">Guests</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(guests)}</td></tr>` : ''}
        </table>
        <h3 style="margin:24px 0 8px;font-family:Georgia,serif;color:#1d2540">Message</h3>
        <div style="white-space:pre-wrap;background:#faf8f3;border-left:3px solid #b08940;padding:14px 16px;border-radius:4px;font-size:14px;line-height:1.6">${escapeHtml(message)}</div>
        <p style="margin-top:24px;color:#9aa0b3;font-size:12px">IP: ${escapeHtml(ip)}</p>
      </div>
    `;

    const fullSubject = `[Syracuse Grand] ${subject} — ${name}`;
    const replyTo = `"${name}" <${email}>`;

    if (usingResendApi()) {
      await sendViaResend({ from, to, replyTo, subject: fullSubject, text, html });
    } else {
      await getTransporter().sendMail({
        from,
        to,
        replyTo,
        subject: fullSubject,
        text,
        html,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('contact form error:', {
      code: err.code,
      command: err.command,
      status: err.status,
      response: err.response,
      responseBody: err.responseBody,
      responseCode: err.responseCode,
      message: err.message,
    });
    res.status(500).json({ ok: false, error: 'Something went wrong sending your message. Please call (315) 701-4400.' });
  }
});

/* ---------- Static file caching ---------- */
function setCaching(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const longCache = ['.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.svg', '.woff', '.woff2', '.ico', '.gif', '.avif'];
  if (longCache.includes(ext)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (ext === '.html' || ext === '') {
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  } else if (filePath.endsWith('sitemap.xml') || filePath.endsWith('robots.txt')) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}

/* ---------- Clean URLs ----------
   Strategy:
     1. Permanent redirects from old `/syracuse-guide.html` → `/local-area`
        and `/syracuse-guide` → `/local-area` (the merged page lives at /local-area).
     2. 301 every `/<page>.html` → `/<page>` to canonicalize URLs (preserves SEO
        because the redirect is permanent and a single hop).
     3. The static middleware below already serves `/<page>` from `<page>.html`
        via `extensions: ['html']`, so we don't need to rename any files.
*/
const MERGED_REDIRECTS = {
  // Old syracuse-guide page merged into local-area
  '/syracuse-guide.html': '/local-area',
  '/syracuse-guide': '/local-area',

  // Legacy .php URLs from the previous LET Group / pre-rebrand site.
  // These are still indexed in Google (Apr-May 2026 crawl) and likely
  // have backlinks from Booking.com, TripAdvisor, directory sites, and
  // partner pages. Permanent 301s pass link equity to the new pages.
  '/liverpool-accommodations.php':   '/rooms',
  '/liverpool-amenities.php':        '/amenities',
  '/liverpool-meetings.php':         '/meetings',
  '/liverpool-hotel-group-travel.php': '/groups',
  '/liverpool-dining.php':           '/local-area',
  '/liverpool-area-guide.php':       '/local-area',
  '/location.php':                   '/contact',
  '/specials.php':                   '/packages',
  '/gallery.php':                    '/gallery',
  '/index.php':                      '/',
  '/home.php':                       '/',
  '/contact.php':                    '/contact',
  '/rooms.php':                      '/rooms',
  '/amenities.php':                  '/amenities',
  '/meetings.php':                   '/meetings',
};
app.get('*', (req, res, next) => {
  // 1. Old guide → merged page
  if (MERGED_REDIRECTS[req.path]) {
    return res.redirect(301, MERGED_REDIRECTS[req.path]);
  }
  // 2. Strip `.html` from any other page — except blog posts (kept as-is for now)
  //    and except files that don't actually exist (let the 404 handler deal).
  if (/\.html$/i.test(req.path) && !req.path.startsWith('/blog/')) {
    const candidate = path.join(ROOT, req.path.replace(/^\//, ''));
    if (fs.existsSync(candidate) && candidate.startsWith(ROOT)) {
      const clean = req.path.replace(/\.html$/i, '');
      // Index special-case: /index.html → /
      const target = clean === '/index' ? '/' : clean;
      const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
      return res.redirect(301, target + qs);
    }
  }
  next();
});

/* ---------- Serve static files (with .html fallback like Caddy try_files) ---------- */
app.use(express.static(ROOT, {
  extensions: ['html'],
  setHeaders: (res, filePath) => setCaching(res, filePath),
}));

/* ---------- 404 → return index.html only for paths that look like client routes ---------- */
app.use((req, res) => {
  if (req.method !== 'GET') return res.status(404).send('Not found');
  // try /<path>.html if it exists
  const candidate = path.join(ROOT, req.path.replace(/^\//, '') + '.html');
  if (fs.existsSync(candidate) && candidate.startsWith(ROOT)) {
    setCaching(res, candidate);
    return res.sendFile(candidate);
  }
  res.status(404).sendFile(path.join(ROOT, '404.html'), (err) => {
    if (err) res.status(404).type('text/plain').send('Not found');
  });
});

app.listen(PORT, () => {
  console.log(`Syracuse Grand server listening on :${PORT}`);
  console.log(`SMTP configured: ${!!getTransporter()}`);
});
