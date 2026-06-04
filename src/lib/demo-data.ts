import type { Project, ProjectFiles, ChatMessage } from "@/types";

const portfolioHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Alex Carter — Photographer</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="nav">
    <a class="logo" href="#">AC.</a>
    <nav>
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <span class="eyebrow">Photographer · Available 2026</span>
      <h1>Capturing moments that <em>linger</em>.</h1>
      <p>Editorial, travel, and portrait photography from Lisbon and beyond.</p>
      <a class="cta" href="#work">See selected work →</a>
    </section>
    <section id="work" class="grid">
      <div class="card a"></div>
      <div class="card b"></div>
      <div class="card c"></div>
      <div class="card d"></div>
      <div class="card e"></div>
      <div class="card f"></div>
    </section>
    <section id="about" class="about">
      <h2>About</h2>
      <p>Ten years of telling stories through light. Featured in Vogue, It's Nice That, and AIGA Eye on Design.</p>
    </section>
    <section id="contact" class="contact">
      <h2>Let's work together</h2>
      <a class="cta" href="mailto:hello@alexcarter.photo">hello@alexcarter.photo</a>
    </section>
  </main>
  <footer>© 2026 Alex Carter. All rights reserved.</footer>
  <script src="script.js"></script>
</body>
</html>`;

const portfolioCSS = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0f; color: #ededed; line-height: 1.5; }
.nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.logo { font-weight: 700; font-size: 1.2rem; text-decoration: none; color: #fff; }
.nav nav a { color: #aaa; text-decoration: none; margin-left: 1.5rem; font-size: 0.9rem; }
.nav nav a:hover { color: #fff; }
.hero { padding: 6rem 2rem; max-width: 720px; }
.eyebrow { text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.2em; color: #a78bfa; }
.hero h1 { font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 700; margin: 1rem 0; }
.hero h1 em { font-style: italic; color: #a78bfa; }
.hero p { color: #999; font-size: 1.1rem; margin-bottom: 2rem; }
.cta { display: inline-block; padding: 0.8rem 1.5rem; background: linear-gradient(120deg, #8b5cf6, #06b6d4); color: #fff; text-decoration: none; border-radius: 999px; font-size: 0.9rem; font-weight: 500; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; padding: 2rem; }
.card { aspect-ratio: 4/3; border-radius: 12px; }
.card.a { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
.card.b { background: linear-gradient(135deg, #06b6d4, #3b82f6); }
.card.c { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.card.d { background: linear-gradient(135deg, #10b981, #06b6d4); }
.card.e { background: linear-gradient(135deg, #ec4899, #8b5cf6); }
.card.f { background: linear-gradient(135deg, #6366f1, #ec4899); }
.about, .contact { padding: 4rem 2rem; max-width: 720px; }
.about h2, .contact h2 { font-size: 2rem; margin-bottom: 1rem; }
.about p, .contact p { color: #aaa; }
footer { padding: 2rem; text-align: center; color: #555; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.06); }
@media (max-width: 600px) { .nav nav a { margin-left: 1rem; } .hero { padding: 4rem 1.5rem; } }`;

const portfolioJS = `document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});`;

export const DEMO_FILES: ProjectFiles = {
  "index.html": portfolioHTML,
  "styles.css": portfolioCSS,
  "script.js": portfolioJS,
};

const SAAS_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pulse — Analytics for indie hackers</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="nav">
    <a class="logo" href="#">⚡ Pulse</a>
    <nav>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a class="btn-primary" href="#">Sign up</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <h1>Know your numbers.<br/><span class="hl">Ship faster.</span></h1>
      <p>Real-time analytics for indie hackers. No setup, no cookies, no bloat.</p>
      <div class="cta-row">
        <a class="btn-primary" href="#">Start free →</a>
        <a class="btn-ghost" href="#pricing">See pricing</a>
      </div>
    </section>
    <section id="features" class="features">
      <div class="feat"><h3>Real-time</h3><p>See every visitor as it happens.</p></div>
      <div class="feat"><h3>Privacy-first</h3><p>No cookies. GDPR friendly out of the box.</p></div>
      <div class="feat"><h3>Affordable</h3><p>From free. Pro from $9/month.</p></div>
    </section>
    <section id="pricing" class="pricing">
      <div class="plan"><h3>Free</h3><p class="price">$0</p><ul><li>3 projects</li><li>1k events/mo</li></ul></div>
      <div class="plan featured"><h3>Pro</h3><p class="price">$9</p><ul><li>Unlimited</li><li>100k events/mo</li></ul></div>
    </section>
  </main>
  <footer>© 2026 Pulse Labs.</footer>
  <script src="script.js"></script>
</body>
</html>`;

const SAAS_CSS = `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0a0a0f; color: #ededed; line-height: 1.6; }
.nav { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.logo { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: #fff; }
.nav nav a { color: #aaa; text-decoration: none; margin-left: 1.5rem; font-size: 0.9rem; }
.hero { padding: 7rem 2rem 5rem; max-width: 800px; text-align: center; margin: 0 auto; }
.hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 700; }
.hl { background: linear-gradient(120deg, #8b5cf6, #06b6d4); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero p { color: #999; margin: 1.25rem 0 2rem; }
.cta-row { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { display: inline-block; padding: 0.75rem 1.5rem; background: linear-gradient(120deg, #8b5cf6, #06b6d4); color: #fff; text-decoration: none; border-radius: 999px; font-size: 0.9rem; font-weight: 500; }
.btn-ghost { display: inline-block; padding: 0.75rem 1.5rem; color: #fff; text-decoration: none; border-radius: 999px; font-size: 0.9rem; border: 1px solid rgba(255,255,255,0.12); }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; padding: 3rem 2rem; max-width: 1000px; margin: 0 auto; }
.feat { padding: 1.5rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
.feat h3 { margin-bottom: 0.5rem; }
.feat p { color: #aaa; font-size: 0.9rem; }
.pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; padding: 3rem 2rem; max-width: 700px; margin: 0 auto; }
.plan { padding: 1.5rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; text-align: center; }
.plan.featured { border-color: #8b5cf6; box-shadow: 0 0 30px rgba(139,92,246,0.2); }
.price { font-size: 2rem; font-weight: 700; margin: 0.5rem 0 1rem; }
.plan ul { list-style: none; color: #aaa; font-size: 0.9rem; }
.plan li { padding: 0.25rem 0; }
footer { padding: 2rem; text-align: center; color: #555; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.06); }`;

const SAAS_JS = `console.log('Pulse SaaS demo loaded');`;

export const SAAS_FILES: ProjectFiles = {
  "index.html": SAAS_HTML,
  "styles.css": SAAS_CSS,
  "script.js": SAAS_JS,
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-project",
    name: "Alex Carter — Photography Portfolio",
    type: "portfolio",
    prompt:
      "A dark, editorial portfolio for a photographer based in Lisbon. Showcase gallery, about, and contact sections.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    files: DEMO_FILES,
  },
  {
    id: "pulse-saas",
    name: "Pulse — Indie Analytics",
    type: "saas",
    prompt:
      "A modern SaaS landing page for a privacy-first analytics product. Highlight features, pricing, and CTA.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
    files: SAAS_FILES,
  },
  {
    id: "agency-sample",
    name: "Studio Nova — Creative Agency",
    type: "agency",
    prompt:
      "Bold agency website with hero, services grid, case studies, and contact form. Dark theme with neon accents.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
];

export const DEMO_CHAT: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "I've generated the initial layout for your portfolio. Take a look at the preview on the right — let me know what you'd like to change.",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "m2",
    role: "user",
    content: "Make the gallery cards a bit larger and add hover animations.",
    createdAt: Date.now() - 1000 * 60 * 25,
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "Done. Gallery cards are now 4:3 with a subtle scale + glow on hover, and the grid has tighter spacing. Want me to add a lightbox next?",
    createdAt: Date.now() - 1000 * 60 * 24,
  },
];
