// ============================================================
// DEMO EDIT — Shows what happens when you change the CONFIG
// Changes applied vs original:
//   🎨 Color theme  → Coral Energy (red + gold + navy)
//   🔤 Font         → Calibri (was Arial)
//   📝 Title        → Updated company-specific branding
//   📊 Stats        → New numbers and labels
//   📋 Agenda items → Updated topics
//   🌐 Contact      → Updated contact info
// ============================================================

const pptxgen = require("pptxgenjs");

const CONFIG = {
  outputFile: "./Future_of_AI_Deck_CORAL_THEME.pptx",
  title:  "AI Strategy 2026 — Coral Edition",
  author: "Akash Rana",

  // 🎨 NEW THEME: Coral Energy
  colors: {
    background: "2F3C7E",   // deep navy
    dark:       "1A2454",   // darker navy for cards
    primary:    "F96167",   // coral red
    gold:       "F9E795",   // bright gold
    text:       "FFFFFF",
    muted:      "CADCFC",
    gray:       "9AAAC8",
  },

  // 🔤 NEW FONT
  font: {
    heading: "Calibri",
    body:    "Calibri",
  },

  // 📝 UPDATED SLIDE 1
  slide1: {
    eyebrow:    "AI STRATEGY  ·  2026",
    titleLine1: "Winning With",
    titleLine2: "Artificial Intelligence",
    subtitle:   "A strategic playbook for enterprise AI transformation",
  },

  // 📋 UPDATED AGENDA
  slide2: {
    heading: "Today's Agenda",
    items: [
      { n: "01", label: "Why AI Now?",        sub: "The urgency behind enterprise AI adoption in 2026" },
      { n: "02", label: "Our AI Strategy",    sub: "Vision, principles, and roadmap" },
      { n: "03", label: "Key Use Cases",      sub: "Where we are deploying AI first and why" },
      { n: "04", label: "ROI & Metrics",      sub: "How we measure success and value creation" },
      { n: "05", label: "Next Steps",         sub: "Governance, partners, and timeline" },
    ],
  },

  // 📊 UPDATED STATS
  slide3: {
    heading: "The opportunity is now — and it's massive",
    stats: [
      { value: "$4.4T",  label: "Annual productivity\ngain from Gen AI",    icon: "📈" },
      { value: "10×",    label: "Faster product\ndevelopment cycles",        icon: "🚀" },
      { value: "89%",    label: "of CEOs say AI is\na top-3 priority",      icon: "🎯" },
    ],
    sourceNote: "Sources: Goldman Sachs, McKinsey (2025), Gartner AI Survey",
  },

  // KEY TRENDS (unchanged in this demo)
  slide4: {
    heading: "Forces reshaping the AI ecosystem",
    trends: [
      { icon: "🤖", title: "Agentic AI",         desc: "AI systems that plan, reason, and act autonomously across complex multi-step tasks without constant human oversight." },
      { icon: "👁️", title: "Multimodal Models",  desc: "Next-gen models that seamlessly understand text, images, audio, video, and structured data in a unified context." },
      { icon: "⚡", title: "Edge Inference",      desc: "On-device AI running privately on phones, laptops, and IoT hardware — no cloud dependency required." },
      { icon: "🛡️", title: "AI Safety & Alignment", desc: "Enterprise-grade guardrails, red-teaming, constitutional AI, and regulatory frameworks (EU AI Act, NIST)." },
    ],
  },

  // INDUSTRY (unchanged)
  slide5: {
    heading: "Sectors being transformed right now",
    industries: [
      { icon: "🏥", title: "Healthcare",    color: "2EC4B6", points: ["Early disease detection via imaging AI", "Drug discovery 10× faster", "Personalised treatment plans"] },
      { icon: "🏦", title: "Finance",       color: "F9E795", points: ["Real-time fraud detection", "AI-driven trading & risk models", "Hyper-personalised banking"] },
      { icon: "🎓", title: "Education",     color: "F96167", points: ["Adaptive learning at scale", "AI tutors available 24/7", "Automated grading & feedback"] },
      { icon: "🏭", title: "Manufacturing", color: "FB923C", points: ["Predictive maintenance", "Defect detection >99% accuracy", "Autonomous supply chains"] },
    ],
  },

  // TIMELINE (updated milestones)
  slide6: {
    heading: "Our AI transformation roadmap",
    milestones: [
      { year: "Q1 2026", label: "Pilot",       desc: "Launch 3 internal AI pilots across core business units", color: "F96167" },
      { year: "Q2 2026", label: "Scale",        desc: "Deploy winning pilots company-wide with change management", color: "F9E795" },
      { year: "Q3 2026", label: "Optimise",     desc: "Fine-tune models with proprietary data and workflows", color: "2EC4B6" },
      { year: "Q4 2026", label: "Lead",         desc: "Launch AI-powered products and services to market", color: "A78BFA" },
    ],
  },

  // 📢 UPDATED CTA
  slide7: {
    eyebrow:   "LET'S MAKE IT HAPPEN",
    headline:  "Start your AI\njourney today.",
    body:      "Every week without action is market share you can't recover.\nLet's build your AI advantage — together.",
    cta1Label: "Schedule a Call →",
    cta2Label: "Download Brief →",
    contact:   "akash@company.com  ·  company.ai  ·  @companyai",
  },
};

// ─── RENDERING ENGINE ────────────────────────────────────────
const C = CONFIG.colors;
const F = CONFIG.font;
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = CONFIG.author;
pres.title  = CONFIG.title;

function bg(slide) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.background }, line: { color: C.background } });
}
function footer(slide, num) {
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.2, w: 10, h: 0.425, fill: { color: C.dark }, line: { color: C.dark } });
  if (num) slide.addText(`${num}`, { x: 9.3, y: 5.25, w: 0.5, h: 0.25, fontSize: 8, color: C.gray, align: "right", margin: 0 });
}
function eyebrow(slide, text, y = 0.28) {
  slide.addText(text, { x: 0.5, y, w: 9, h: 0.38, fontSize: 9, color: C.primary, bold: true, charSpacing: 4, margin: 0, fontFace: F.body });
}
function heading(slide, text, y = 0.62) {
  slide.addText(text, { x: 0.5, y, w: 9, h: 0.6, fontSize: 26, color: C.text, bold: true, margin: 0, fontFace: F.heading });
}

// SLIDE 1
{ const D = CONFIG.slide1; let s = pres.addSlide(); bg(s);
  s.addShape(pres.shapes.OVAL, { x: 7.2, y: -0.8, w: 3.5, h: 3.5, fill: { color: C.primary, transparency: 82 }, line: { color: C.primary, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: 8.0, y: 3.2,  w: 2.2, h: 2.2, fill: { color: C.gold,    transparency: 88 }, line: { color: C.gold, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: -0.8, y: 3.8, w: 2.5, h: 2.5, fill: { color: C.muted,   transparency: 85 }, line: { color: C.muted, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.52, w: 2.8, h: 0.04, fill: { color: C.primary }, line: { color: C.primary } });
  s.addText(D.eyebrow,    { x: 0.6, y: 2.0,  w: 8,   h: 0.4,  fontSize: 9,  color: C.primary, bold: true, charSpacing: 4, margin: 0, fontFace: F.body });
  s.addText(D.titleLine1, { x: 0.6, y: 2.65, w: 8,   h: 1.0,  fontSize: 52, color: C.text,    bold: true, margin: 0, fontFace: F.heading });
  s.addText(D.titleLine2, { x: 0.6, y: 3.55, w: 8.5, h: 0.7,  fontSize: 28, color: C.muted,   margin: 0, fontFace: F.heading });
  s.addText(D.subtitle,   { x: 0.6, y: 4.4,  w: 7,   h: 0.55, fontSize: 11, color: C.gray, italic: true, margin: 0, fontFace: F.body });
  footer(s); }

// SLIDE 2
{ const D = CONFIG.slide2; let s = pres.addSlide(); bg(s);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: C.primary }, line: { color: C.primary } });
  eyebrow(s, "AGENDA", 0.35);
  s.addText(D.heading, { x: 0.4, y: 0.75, w: 9, h: 0.7, fontSize: 30, color: C.text, bold: true, margin: 0, fontFace: F.heading });
  D.items.forEach((item, i) => {
    const y = 1.65 + i * 0.72;
    s.addShape(pres.shapes.OVAL, { x: 0.4, y: y + 0.05, w: 0.52, h: 0.52, fill: { color: C.primary, transparency: 20 }, line: { color: C.primary, width: 0 } });
    s.addText(item.n, { x: 0.4, y: y + 0.05, w: 0.52, h: 0.52, fontSize: 10, color: C.text, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(item.label, { x: 1.1, y, w: 4, h: 0.32, fontSize: 13, color: C.text, bold: true, margin: 0, fontFace: F.heading });
    s.addText(item.sub,   { x: 1.1, y: y + 0.3, w: 7.5, h: 0.28, fontSize: 9.5, color: C.gray, margin: 0, fontFace: F.body });
    if (i < D.items.length - 1) s.addShape(pres.shapes.LINE, { x: 0.4, y: y + 0.65, w: 9.2, h: 0, line: { color: C.muted, width: 0.5, transparency: 70 } });
  });
  footer(s, 2); }

// SLIDE 3
{ const D = CONFIG.slide3; let s = pres.addSlide(); bg(s);
  eyebrow(s, "THE OPPORTUNITY"); heading(s, D.heading);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.38, w: 9, h: 0.03, fill: { color: C.muted, transparency: 60 }, line: { color: C.muted } });
  D.stats.forEach((stat, i) => {
    const x = 0.4 + i * 3.2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.9, h: 2.85, fill: { color: C.dark }, line: { color: C.primary, width: 0.8 }, rectRadius: 0.12 });
    s.addText(stat.icon,  { x, y: 1.75, w: 2.9, h: 0.55, fontSize: 26, align: "center", margin: 0 });
    s.addText(stat.value, { x, y: 2.25, w: 2.9, h: 0.9,  fontSize: 40, color: C.gold, bold: true, align: "center", margin: 0, fontFace: F.heading });
    s.addText(stat.label, { x, y: 3.15, w: 2.9, h: 0.65, fontSize: 11, color: C.muted, align: "center", margin: 0, fontFace: F.body });
  });
  s.addText(D.sourceNote, { x: 0.5, y: 4.95, w: 9, h: 0.28, fontSize: 7.5, color: C.gray, italic: true, margin: 0 });
  footer(s, 3); }

// SLIDE 4
{ const D = CONFIG.slide4; let s = pres.addSlide(); bg(s);
  eyebrow(s, "KEY TRENDS"); heading(s, D.heading);
  s.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: 1.4, w: 0.03, h: 3.5, fill: { color: C.muted, transparency: 50 }, line: { color: C.muted } });
  D.trends.forEach((t, i) => {
    const col = i < 2 ? 0 : 1; const row = i % 2;
    const x = 0.4 + col * 4.7; const y = 1.42 + row * 1.7;
    s.addText(t.icon,  { x, y, w: 0.55, h: 0.55, fontSize: 22, margin: 0 });
    s.addText(t.title, { x: x + 0.65, y: y + 0.04, w: 3.7, h: 0.38, fontSize: 14, color: C.gold, bold: true, margin: 0, fontFace: F.heading });
    s.addText(t.desc,  { x, y: y + 0.5, w: 4.35, h: 0.85, fontSize: 10.5, color: C.muted, margin: 0, fontFace: F.body });
  });
  footer(s, 4); }

// SLIDE 5
{ const D = CONFIG.slide5; let s = pres.addSlide(); bg(s);
  eyebrow(s, "USE CASES"); heading(s, D.heading);
  const positions = [{ x: 0.4, y: 1.45 }, { x: 5.2, y: 1.45 }, { x: 0.4, y: 3.28 }, { x: 5.2, y: 3.28 }];
  D.industries.forEach((ind, i) => {
    const { x, y } = positions[i];
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 4.55, h: 1.7, fill: { color: C.dark }, line: { color: ind.color, width: 1.2 }, rectRadius: 0.1 });
    s.addText(`${ind.icon}  ${ind.title}`, { x: x + 0.15, y: y + 0.12, w: 4.2, h: 0.4, fontSize: 14, color: ind.color, bold: true, margin: 0, fontFace: F.heading });
    s.addText(ind.points.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), { x: x + 0.2, y: y + 0.54, w: 4.1, h: 1.0, fontSize: 9.5, color: C.muted, margin: 0, fontFace: F.body });
  });
  footer(s, 5); }

// SLIDE 6
{ const D = CONFIG.slide6; let s = pres.addSlide(); bg(s);
  eyebrow(s, "OUR ROADMAP"); heading(s, D.heading);
  s.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 2.55, w: 9.0, h: 0.04, fill: { color: C.primary, transparency: 30 }, line: { color: C.primary } });
  D.milestones.forEach((m, i) => {
    const x = 0.5 + i * 2.25;
    s.addShape(pres.shapes.OVAL, { x: x + 0.6, y: 2.38, w: 0.35, h: 0.35, fill: { color: m.color }, line: { color: m.color } });
    s.addText(m.year,  { x, y: 2.82, w: 1.8, h: 0.35, fontSize: 13, color: m.color, bold: true, align: "center", margin: 0, fontFace: F.heading });
    s.addText(m.label, { x, y: 3.18, w: 1.8, h: 0.35, fontSize: 11, color: C.text, bold: true, align: "center", margin: 0, fontFace: F.heading });
    s.addText(m.desc,  { x, y: 3.55, w: 1.95, h: 0.95, fontSize: 8.5, color: C.gray, align: "center", margin: 0, fontFace: F.body });
    s.addText(m.label.toUpperCase(), { x, y: i % 2 === 0 ? 1.6 : 1.2, w: 1.8, h: 0.8, fontSize: 8, color: m.color, align: "center", bold: true, charSpacing: 2, margin: 0 });
    s.addShape(pres.shapes.LINE, { x: x + 0.75, y: 2.38, w: 0, h: i % 2 === 0 ? -0.6 : -0.55, line: { color: m.color, width: 1, dashType: "sysDot" } });
  });
  footer(s, 6); }

// SLIDE 7
{ const D = CONFIG.slide7; let s = pres.addSlide(); bg(s);
  s.addShape(pres.shapes.OVAL, { x: 6.0, y: -1.2, w: 5.5, h: 5.5, fill: { color: C.primary, transparency: 90 }, line: { color: C.primary, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: -1.5, y: 2.8, w: 4.0, h: 4.0, fill: { color: C.gold, transparency: 92 }, line: { color: C.gold, width: 0 } });
  s.addText(D.eyebrow,  { x: 0.7, y: 0.7, w: 8.5, h: 0.5, fontSize: 10, color: C.primary, bold: true, charSpacing: 4, margin: 0, fontFace: F.body });
  s.addText(D.headline, { x: 0.7, y: 1.2, w: 8.5, h: 1.4, fontSize: 44, color: C.text, bold: true, margin: 0, fontFace: F.heading });
  s.addText(D.body,     { x: 0.7, y: 2.7, w: 7.5, h: 0.95, fontSize: 13, color: C.muted, margin: 0, fontFace: F.body });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.7, y: 3.65, w: 2.8, h: 0.62, fill: { color: C.primary }, line: { color: C.primary }, rectRadius: 0.08 });
  s.addText(D.cta1Label, { x: 0.7, y: 3.65, w: 2.8, h: 0.62, fontSize: 13, color: C.background, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 3.8, y: 3.65, w: 2.8, h: 0.62, fill: { color: C.dark }, line: { color: C.primary, width: 1.2 }, rectRadius: 0.08 });
  s.addText(D.cta2Label, { x: 3.8, y: 3.65, w: 2.8, h: 0.62, fontSize: 13, color: C.text, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(D.contact, { x: 0.7, y: 4.6, w: 8, h: 0.35, fontSize: 9.5, color: C.gray, margin: 0, fontFace: F.body });
  footer(s, 7); }

pres.writeFile({ fileName: CONFIG.outputFile }).then(() => {
  console.log("\n✅  Coral-themed edited presentation saved!");
  console.log(`📁  File: ${CONFIG.outputFile}`);
  console.log("🔄  Changes made vs original:");
  console.log("    🎨  Theme      → Coral Energy (red #F96167 + gold #F9E795 + navy #2F3C7E)");
  console.log("    🔤  Font       → Calibri (was Arial)");
  console.log("    📝  Title      → 'Winning With Artificial Intelligence'");
  console.log("    📊  Stats      → $4.4T / 10× / 89% (new numbers + labels)");
  console.log("    📋  Agenda     → 5 updated agenda items");
  console.log("    🗓️  Timeline   → Q1–Q4 2026 quarterly milestones");
  console.log("    📢  CTA        → 'Start your AI journey today.'");
  console.log("    📞  Contact    → Updated email + handles\n");
}).catch(err => { console.error("❌ Error:", err); process.exit(1); });
