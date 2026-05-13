# Syracuse Grand Blog — 8 New Post Spec

## Hard rules for every post

- Length: 700-900 words of body content (excluding header/footer/CTA)
- Voice: warm, practical, first-person plural ("we", "our front-desk team"). Concrete local detail. NO generic AI travel filler.
- File template: copy `/blog/things-to-do-near-destiny-usa.html` exactly, replace title/meta/schema/body/canonical/og/twitter for each post. Keep header/footer includes, blog.css link, font links, all schema (Article + BreadcrumbList).
- Internal links REQUIRED in every post (all open in same tab):
  - `/` (homepage book direct)
  - At least 2 of these landing pages depending on relevance: `/hotels-syracuse-ny`, `/hotels-near-destiny-usa`, `/hotels-near-syracuse-university`, `/hotels-near-syracuse-airport`, `/hotels-near-empower-amphitheater`, `/hotels-near-jma-wireless-dome`, `/hotels-near-nys-fairgrounds`, `/hotels-near-upstate-medical`, `/hotels-near-micron-clay-ny`, `/pet-friendly-hotels-syracuse`, `/local-area`, `/packages`, `/groups`
  - Phone: tel:+13157014400, formatted as (315) 701-4400
- CTA at bottom: identical "Stay with us in Liverpool, NY" aside used in existing posts
- Hotel facts to use accurately:
  - Address: 136 Transistor Pkwy, Liverpool NY 13088
  - Phone: (315) 701-4400
  - 61 renovated rooms (king, two-queen, suites)
  - Free hot breakfast 6:30-9:30am
  - Free self-parking, truck/RV parking, $5/day extended parking
  - Indoor heated pool + hot tub
  - 24/7 front desk, 24-hour fitness center
  - Pet-friendly: dogs under 50 lbs, $25/night
  - 4 miles from Syracuse Hancock International Airport (SYR)
  - 4-7 miles from Destiny USA, Syracuse University, NYS Fairgrounds, Upstate Medical
  - 6 miles from Micron Clay site
  - Right next door to Lockheed Martin Electronics Park (497 Electronics Pkwy, walking distance, same 13088 zip)
  - 4 miles to Empower FCU Amphitheater at Lakeview
  - Official NYS Fair Hotel Partner
  - 1 banquet/meeting room for groups up to 30-50
- DO NOT mention 3.7 stars, review counts, or any quantitative review claims
- DO NOT use "Best Western," "Carrier Dome," "St. Joseph's Health Amphitheater," "Empower Federal Credit Union" (full spell-out)
- Use "Empower FCU Amphitheater at Lakeview" first, "Empower FCU Amphitheater" subsequent
- Use "JMA Wireless Dome" not "Carrier Dome"
- Use "Syracuse Hancock International Airport (SYR)" first, "SYR" subsequent
- Em-dash JSON-LD escape: `\u2014`. Apostrophes in JSON-LD: use `\u2019` if causing parse issues, but standard `'` works fine inside double-quoted JSON values.

## Post specs

### Post 1: SU Game Day Weekend Planner
- Filename: `blog/su-game-day-weekend-syracuse.html`
- Slug: /blog/su-game-day-weekend-syracuse
- Date: 2026-05-13
- Title: SU Game Day Weekend in Syracuse: Where to Stay, Park, and Eat
- Eyebrow: Local Guide · SU Game Day
- Hero image: assets/images/syracuse-university.jpg
- Target queries: "su game day hotels", "where to stay syracuse football", "syracuse university game weekend"
- H1: SU Game Day Weekend in Syracuse: Where to Stay, Park, and Eat
- Lede: 1-2 sentences about how the right basecamp makes the weekend easier
- Sections (suggested H2/H3 outline):
  - The smart base for game weekend (why hotel north of city is better than downtown)
  - Getting to the JMA Wireless Dome (route, parking, rideshare tips)
  - Pre-game eats (3-4 spots: Dinosaur Bar-B-Que, Phoebe's, Heid's, Stella's Diner)
  - Tailgate logistics (what to know about campus parking $20-40, Manley lot, etc.)
  - Post-game wind-down (Armory Square or quiet hotel pool)
  - Big SU weekends to plan ahead for (Commencement, Orange Out, parents weekend, ACC tournament)
  - Stay close to the action (CTA paragraph)
- Internal links to use: `/hotels-near-syracuse-university`, `/hotels-near-jma-wireless-dome`, `/packages`, `/`

### Post 2: NYS Fair Survival Guide
- Filename: `blog/nys-fair-survival-guide.html`
- Slug: /blog/nys-fair-survival-guide
- Date: 2026-05-13
- Title: The NYS Fair Survival Guide: Hotels, Parking, and Food (2026)
- Eyebrow: Local Guide · NYS Fair
- Hero image: assets/images/state-fair.jpg
- Target queries: "nys fair hotels", "great new york state fair lodging", "nys fairgrounds hotels nearby"
- Sections:
  - About the Great NYS Fair (13 days, late August through Labor Day, ~one million visitors)
  - Where to stay (we're an Official NYS Fair Hotel Partner; 7 miles, 12 minutes)
  - How to get to the fairgrounds (route, $5 parking, Park & Ride options, no traffic-jam gate hours)
  - Don't-miss food (chicken hots, Gianelli sausage, milk-chocolate chip cookies, free 12oz milk at the Dairy Building)
  - The free concert series (Chevy Court + Suburban Park lineups recur — what to expect)
  - Days to skip vs days to go (weekday tip vs weekend warning)
  - Stay with us (CTA)
- Internal links: `/hotels-near-nys-fairgrounds`, `/local-area`, `/packages`, mention Official NYS Fair Hotel Partner status with link to nysfair.ny.gov hotel partners page

### Post 3: Micron Contractor's Guide to Liverpool
- Filename: `blog/micron-contractor-stay-guide.html`
- Slug: /blog/micron-contractor-stay-guide
- Date: 2026-05-14
- Title: A Contractor's Guide to Staying Near the Micron Clay Site
- Eyebrow: Business Travel · Micron / Clay
- Hero image: assets/images/micron.jpg
- Target queries: "hotels near micron clay", "extended stay liverpool ny", "micron contractor lodging"
- Sections:
  - The Micron Clay project (the $100B megafab, 9,000 jobs, 20-year build, briefly)
  - Why Liverpool is the smart base (10 minutes to site, away from constructionconvergence)
  - What contractors and engineers need (long stays, direct billing, late check-in, fast WiFi, real breakfast, free parking)
  - Workday logistics nearby (Wegmans, dry-cleaning, FedEx, Lockheed across the parking lot)
  - Direct billing + corporate rates available — call us
  - The route to the site (Electronics Pkwy → I-90 W → Exit 36 → NY-31)
  - Stay with us CTA
- Internal links: `/hotels-near-micron-clay-ny`, `/groups`, `/contact`, `/`

### Post 4: 2026 Empower FCU Amphitheater Concert Guide
- Filename: `blog/empower-fcu-amphitheater-concert-guide-2026.html`
- Slug: /blog/empower-fcu-amphitheater-concert-guide-2026
- Date: 2026-05-14
- Title: 2026 Empower FCU Amphitheater Concert Guide: Hotels, Parking, Logistics
- Eyebrow: Local Guide · Concerts
- Hero image: assets/images/empower-amphitheater.jpg
- Target queries: "hotels near empower amphitheater", "lakeview amphitheater concerts hotels", "empower fcu amphitheater syracuse hotel"
- Sections:
  - About the venue (17,500 seats, lakefront, late-May–early-October season, 20+ shows in 2026 confirmed)
  - Why the Syracuse Grand is the smart base (~12 min, no $20 parking after the show, late checkout)
  - Getting to the show (I-690, exit 7 Onondaga Lake Pkwy, drop-off vs lots, rideshare zones)
  - Pre-show food in Liverpool (Brooklyn Pickle, Heid's, etc.)
  - Concert-night perks for direct bookers (1pm late checkout, free breakfast, free WiFi, quiet hotel)
  - 2026 highlight shows (use the venue's published list — give a teaser of what's confirmed without making up specific shows; reference syrvenues.com)
  - Stay with us CTA
- Internal links: `/hotels-near-empower-amphitheater`, `/packages`, `/local-area`

### Post 5: JMA Wireless Dome Event Hotel Guide
- Filename: `blog/jma-wireless-dome-event-hotels.html`
- Slug: /blog/jma-wireless-dome-event-hotels
- Date: 2026-05-14
- Title: JMA Wireless Dome Event Guide: Hotels, Parking, and Game-Day Tips
- Eyebrow: Local Guide · JMA Dome
- Hero image: assets/images/syracuse-university.jpg
- Target queries: "jma dome hotels", "jma wireless dome parking", "syracuse dome event hotels"
- Sections:
  - The JMA Wireless Dome (formerly the campus dome — now JMA — 49K football, 34K basketball, plus stadium concerts like Springsteen, Billy Joel)
  - The smart hotel choice (Syracuse Grand, 12 min, free parking)
  - Getting to the dome (route, exit 18 Adams St, where to park if not on campus)
  - Game-day food (Dinosaur, Heid's, Phoebe's)
  - Concert-night logistics (different from game days — load-out can run late)
  - Big event windows (football fall Saturdays, basketball Nov-Mar, lacrosse spring, commencement weekend)
  - Stay with us CTA
- Internal links: `/hotels-near-jma-wireless-dome`, `/hotels-near-syracuse-university`, `/packages`

### Post 6: Onondaga Lake Park Weekend
- Filename: `blog/onondaga-lake-park-guide.html`
- Slug: /blog/onondaga-lake-park-guide
- Date: 2026-05-15
- Title: A Local's Guide to Onondaga Lake Park (Trails, Salt Museum, and Heid's)
- Eyebrow: Local Guide · Onondaga Lake
- Hero image: assets/images/onondaga-lake.jpg
- Target queries: "things to do onondaga lake", "onondaga lake park guide", "salt museum syracuse"
- Sections:
  - About the park (the "Central Park of Central New York", 8+ miles of paved trail, free)
  - The West Shore Trail (start points, sunset views toward downtown)
  - The Wegmans Boundless Playground & 16,000 sq ft Skatepark
  - The Salt Museum (free, the salt-boiling block, why Syracuse is "Salt City")
  - Sainte Marie Among the Iroquois (free historical site)
  - Heid's of Liverpool tradition (~100 years, the white-hot, the dipper-dog)
  - The Carousel at Lakeview Point (free, lakeside)
  - Where to stay nearby (Syracuse Grand, 4 minutes away)
- Internal links: `/local-area`, `/hotels-near-destiny-usa`, `/`

### Post 7: Kid-Friendly Syracuse Weekend
- Filename: `blog/kid-friendly-syracuse-weekend.html`
- Slug: /blog/kid-friendly-syracuse-weekend
- Date: 2026-05-15
- Title: A Kid-Friendly Syracuse Weekend: Destiny USA, the Zoo, and a Hotel Pool
- Eyebrow: Local Guide · Family
- Hero image: assets/images/zoo.jpg
- Target queries: "family hotels syracuse", "kid friendly things to do syracuse", "syracuse with kids weekend"
- Sections:
  - Why families pick Liverpool over downtown (parking, breakfast, pool, quiet)
  - Saturday morning: Destiny USA + Apex Entertainment / WonderWorks
  - Saturday lunch: Brooklyn Pickle or Heid's
  - Saturday afternoon: Rosamond Gifford Zoo (small, well-run, half-day)
  - Saturday night: Hotel pool + free breakfast in the morning
  - Sunday: Onondaga Lake Park & Wegmans Boundless Playground
  - The MOST (rainy-day backup)
  - Stay with us CTA
- Internal links: `/hotels-near-destiny-usa`, `/local-area`, `/packages`, `/`

### Post 8: Liverpool Restaurants — Where Locals Actually Eat
- Filename: `blog/liverpool-ny-restaurants-locals-guide.html`
- Slug: /blog/liverpool-ny-restaurants-locals-guide
- Date: 2026-05-15
- Title: Where Locals Actually Eat in Liverpool, NY (Beyond the Chains)
- Eyebrow: Local Guide · Dining
- Hero image: assets/images/downtown-syracuse.jpg
- Target queries: "best restaurants liverpool ny", "where to eat liverpool ny", "syracuse area restaurants locals"
- Sections (this is a sister piece to existing where-to-eat-liverpool-ny.html, but framed differently — go deeper on each spot):
  - Heid's of Liverpool (~100 years, the institution)
  - Brooklyn Pickle (best deli sandwich north of Manhattan)
  - Limp Lizard BBQ on Old Liverpool Rd
  - Tully's Good Times (the chicken-tenders spot since 1989)
  - Stella's Diner in the city
  - Dinosaur Bar-B-Que (Willow St, the original)
  - Phoebe's Restaurant (Genesee St)
  - Alto Cinco (Westcott)
  - The honorable mentions block
  - Stay with us CTA
- Internal links: `/local-area`, `/`, `/hotels-syracuse-ny`. NOTE: do not duplicate the older /blog/where-to-eat-liverpool-ny.html page — this one goes deeper.

## Output

Write each of the 8 HTML files to /home/user/workspace/syracuse-grand/blog/<filename>. Use the existing things-to-do-near-destiny-usa.html as your structural template. Match its style EXACTLY for header, schema, hero, body wrapping, footer, scripts.

Then update /home/user/workspace/syracuse-grand/blog/index.html to add the 8 new posts as `<a class="blog-card">` entries at the TOP of the existing grid (newest first). Use the same card pattern.

Then update /home/user/workspace/syracuse-grand/sitemap.xml — add `<url>` entries for each of the 8 new blog posts with `<lastmod>2026-05-15</lastmod>` and `<changefreq>monthly</changefreq>` and `<priority>0.7</priority>`.

DO NOT commit. I will commit after reviewing.
