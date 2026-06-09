// ============================================================
// PPTX Skill Demo — "Future of AI" Pitch Deck
// Implements Anthropic's PPTX Skill using pptxgenjs
// Color palette: Midnight Executive (navy + ice blue + white)
// ============================================================

const pptxgen = require("pptxgenjs");

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "PPTX Skill Demo";
pres.title = "The Future of AI — 2026 Outlook";

// ─── COLOR PALETTE (Midnight Executive) ─────────────────────
const C = {
  navy:    "1E2761",
  iceBlue: "CADCFC",
  white:   "FFFFFF",
  accent:  "4FC3F7",
  dark:    "0D1440",
  gray:    "8FA3C1",
  gold:    "F9C74F",
};

// ─── HELPERS ────────────────────────────────────────────────

function navyBg(slide) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: C.navy }, line: { color: C.navy },
  });
}

function accentBar(slide, y = 5.2) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y, w: 10, h: 0.425,
    fill: { color: C.dark }, line: { color: C.dark },
  });
}

function slideNumber(slide, n) {
  slide.addText(`${n}`, {
    x: 9.3, y: 5.25, w: 0.5, h: 0.25,
    fontSize: 8, color: C.gray, align: "right", margin: 0,
  });
}

// ============================================================
// SLIDE 1 — TITLE SLIDE (dark)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  // Decorative circles
  s.addShape(pres.shapes.OVAL, {
    x: 7.2, y: -0.8, w: 3.5, h: 3.5,
    fill: { color: C.accent, transparency: 82 }, line: { color: C.accent, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 8.0, y: 3.2, w: 2.2, h: 2.2,
    fill: { color: C.gold, transparency: 88 }, line: { color: C.gold, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -0.8, y: 3.8, w: 2.5, h: 2.5,
    fill: { color: C.iceBlue, transparency: 85 }, line: { color: C.iceBlue, width: 0 },
  });

  // Thin accent line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 2.52, w: 2.8, h: 0.04,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  // Eyebrow
  s.addText("PITCH DECK  ·  2026", {
    x: 0.6, y: 2.0, w: 8, h: 0.4,
    fontSize: 9, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });

  // Title
  s.addText("The Future", {
    x: 0.6, y: 2.65, w: 8, h: 1.0,
    fontSize: 52, color: C.white, bold: true, margin: 0,
  });
  s.addText("of Artificial Intelligence", {
    x: 0.6, y: 3.55, w: 8.5, h: 0.7,
    fontSize: 28, color: C.iceBlue, bold: false, margin: 0,
  });

  // Subtitle
  s.addText("How AI is reshaping industries, economies, and human potential", {
    x: 0.6, y: 4.4, w: 7, h: 0.55,
    fontSize: 11, color: C.gray, italic: true, margin: 0,
  });

  accentBar(s);
}

// ============================================================
// SLIDE 2 — AGENDA
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  // Left sidebar stripe
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.18, h: 5.625,
    fill: { color: C.accent }, line: { color: C.accent },
  });

  s.addText("AGENDA", {
    x: 0.4, y: 0.35, w: 9, h: 0.5,
    fontSize: 10, color: C.accent, bold: true, charSpacing: 5, margin: 0,
  });
  s.addText("What We'll Cover Today", {
    x: 0.4, y: 0.75, w: 9, h: 0.7,
    fontSize: 30, color: C.white, bold: true, margin: 0,
  });

  const items = [
    { n: "01", label: "Market Landscape", sub: "The current state of AI adoption globally" },
    { n: "02", label: "Key Trends for 2026", sub: "Multimodal models, agentic AI, and edge inference" },
    { n: "03", label: "Industry Impact",   sub: "Healthcare, finance, education & manufacturing" },
    { n: "04", label: "Our Vision",        sub: "Where we are heading and why it matters" },
    { n: "05", label: "Call to Action",    sub: "Partner with us to build the future" },
  ];

  items.forEach((item, i) => {
    const y = 1.65 + i * 0.72;
    // Number bubble
    s.addShape(pres.shapes.OVAL, {
      x: 0.4, y: y + 0.05, w: 0.52, h: 0.52,
      fill: { color: C.accent, transparency: 20 }, line: { color: C.accent, width: 0 },
    });
    s.addText(item.n, {
      x: 0.4, y: y + 0.05, w: 0.52, h: 0.52,
      fontSize: 10, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
    });
    s.addText(item.label, {
      x: 1.1, y: y, w: 4, h: 0.32,
      fontSize: 13, color: C.white, bold: true, margin: 0,
    });
    s.addText(item.sub, {
      x: 1.1, y: y + 0.3, w: 7.5, h: 0.28,
      fontSize: 9.5, color: C.gray, margin: 0,
    });
    // divider
    if (i < items.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: 0.4, y: y + 0.65, w: 9.2, h: 0,
        line: { color: C.iceBlue, width: 0.5, transparency: 70 },
      });
    }
  });

  accentBar(s);
  slideNumber(s, 2);
}

// ============================================================
// SLIDE 3 — MARKET LANDSCAPE (big stats)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  s.addText("MARKET LANDSCAPE", {
    x: 0.5, y: 0.3, w: 9, h: 0.4,
    fontSize: 9, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("AI is the defining technology of our era", {
    x: 0.5, y: 0.65, w: 9, h: 0.65,
    fontSize: 28, color: C.white, bold: true, margin: 0,
  });

  // Divider line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.38, w: 9, h: 0.03,
    fill: { color: C.iceBlue, transparency: 60 }, line: { color: C.iceBlue },
  });

  // 3 stat cards
  const stats = [
    { value: "$1.8T",  label: "Global AI Market\nby 2030",       icon: "💹" },
    { value: "73%",    label: "Enterprises actively\ndeploying AI", icon: "🏢" },
    { value: "300M+",  label: "Jobs transformed\nby 2028",        icon: "👥" },
  ];

  stats.forEach((stat, i) => {
    const x = 0.4 + i * 3.2;
    // Card bg
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.6, w: 2.9, h: 2.85,
      fill: { color: C.dark }, line: { color: C.accent, width: 0.8 },
      rectRadius: 0.12,
    });
    // Icon
    s.addText(stat.icon, {
      x, y: 1.75, w: 2.9, h: 0.55,
      fontSize: 26, align: "center", margin: 0,
    });
    // Big number
    s.addText(stat.value, {
      x, y: 2.25, w: 2.9, h: 0.9,
      fontSize: 40, color: C.gold, bold: true, align: "center", margin: 0,
    });
    // Label
    s.addText(stat.label, {
      x, y: 3.15, w: 2.9, h: 0.65,
      fontSize: 11, color: C.iceBlue, align: "center", margin: 0,
    });
  });

  // Source note
  s.addText("Sources: McKinsey Global Institute, IDC, World Economic Forum (2025)", {
    x: 0.5, y: 4.95, w: 9, h: 0.28,
    fontSize: 7.5, color: C.gray, italic: true, margin: 0,
  });

  accentBar(s);
  slideNumber(s, 3);
}

// ============================================================
// SLIDE 4 — KEY TRENDS (two-column)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  // Header
  s.addText("KEY TRENDS FOR 2026", {
    x: 0.5, y: 0.28, w: 9, h: 0.38,
    fontSize: 9, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("Forces reshaping the AI ecosystem", {
    x: 0.5, y: 0.62, w: 9, h: 0.6,
    fontSize: 26, color: C.white, bold: true, margin: 0,
  });

  // Vertical divider
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 1.4, w: 0.03, h: 3.5,
    fill: { color: C.iceBlue, transparency: 50 }, line: { color: C.iceBlue },
  });

  const trends = [
    {
      icon: "🤖", title: "Agentic AI",
      desc: "AI systems that plan, reason, and act autonomously across complex multi-step tasks without constant human oversight.",
    },
    {
      icon: "👁️", title: "Multimodal Models",
      desc: "Next-gen models that seamlessly understand text, images, audio, video, and structured data in a unified context.",
    },
    {
      icon: "⚡", title: "Edge Inference",
      desc: "On-device AI running privately on phones, laptops, and IoT hardware — no cloud dependency required.",
    },
    {
      icon: "🛡️", title: "AI Safety & Alignment",
      desc: "Enterprise-grade guardrails, red-teaming, constitutional AI, and regulatory frameworks (EU AI Act, NIST).",
    },
  ];

  trends.forEach((t, i) => {
    const col = i < 2 ? 0 : 1;
    const row = i % 2;
    const x = 0.4 + col * 4.7;
    const y = 1.42 + row * 1.7;

    s.addText(t.icon, {
      x, y, w: 0.55, h: 0.55,
      fontSize: 22, margin: 0,
    });
    s.addText(t.title, {
      x: x + 0.65, y: y + 0.04, w: 3.7, h: 0.38,
      fontSize: 14, color: C.gold, bold: true, margin: 0,
    });
    s.addText(t.desc, {
      x, y: y + 0.5, w: 4.35, h: 0.85,
      fontSize: 10.5, color: C.iceBlue, margin: 0,
    });
  });

  accentBar(s);
  slideNumber(s, 4);
}

// ============================================================
// SLIDE 5 — INDUSTRY IMPACT (2×2 grid)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  s.addText("INDUSTRY IMPACT", {
    x: 0.5, y: 0.28, w: 9, h: 0.38,
    fontSize: 9, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("Sectors being transformed right now", {
    x: 0.5, y: 0.62, w: 9, h: 0.6,
    fontSize: 26, color: C.white, bold: true, margin: 0,
  });

  const industries = [
    {
      icon: "🏥", title: "Healthcare",
      color: "2EC4B6",
      points: ["Early disease detection via imaging AI", "Drug discovery 10× faster", "Personalised treatment plans"],
    },
    {
      icon: "🏦", title: "Finance",
      color: "F9C74F",
      points: ["Real-time fraud detection", "AI-driven trading & risk models", "Hyper-personalised banking"],
    },
    {
      icon: "🎓", title: "Education",
      color: "A78BFA",
      points: ["Adaptive learning at scale", "AI tutors available 24/7", "Automated grading & feedback"],
    },
    {
      icon: "🏭", title: "Manufacturing",
      color: "F77F00",
      points: ["Predictive maintenance", "Defect detection >99% accuracy", "Autonomous supply chains"],
    },
  ];

  const positions = [
    { x: 0.4, y: 1.45 },
    { x: 5.2, y: 1.45 },
    { x: 0.4, y: 3.28 },
    { x: 5.2, y: 3.28 },
  ];

  industries.forEach((ind, i) => {
    const { x, y } = positions[i];
    // Card
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.55, h: 1.7,
      fill: { color: C.dark }, line: { color: ind.color, width: 1.2 },
      rectRadius: 0.1,
    });
    // Icon + title
    s.addText(`${ind.icon}  ${ind.title}`, {
      x: x + 0.15, y: y + 0.12, w: 4.2, h: 0.4,
      fontSize: 14, color: ind.color, bold: true, margin: 0,
    });
    // Bullet points
    s.addText(ind.points.map(p => ({ text: p, options: { bullet: true, breakLine: true } })), {
      x: x + 0.2, y: y + 0.54, w: 4.1, h: 1.0,
      fontSize: 9.5, color: C.iceBlue, margin: 0,
    });
  });

  accentBar(s);
  slideNumber(s, 5);
}

// ============================================================
// SLIDE 6 — OUR VISION (timeline)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  s.addText("OUR VISION", {
    x: 0.5, y: 0.28, w: 9, h: 0.38,
    fontSize: 9, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });
  s.addText("A roadmap to human-AI collaboration", {
    x: 0.5, y: 0.62, w: 9, h: 0.6,
    fontSize: 26, color: C.white, bold: true, margin: 0,
  });

  // Timeline line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 2.55, w: 9.0, h: 0.04,
    fill: { color: C.accent, transparency: 30 }, line: { color: C.accent },
  });

  const milestones = [
    { year: "2024", label: "Foundation", desc: "GPT-4, Claude 3, Gemini Ultra launch — multimodal era begins", color: C.accent },
    { year: "2025", label: "Adoption",   desc: "Agentic workflows deployed at Fortune 500 scale", color: C.gold },
    { year: "2026", label: "Integration",desc: "AI embedded in every software product and workflow", color: "A78BFA" },
    { year: "2028", label: "Symbiosis",  desc: "Human + AI teams outperform either alone in every domain", color: "2EC4B6" },
  ];

  milestones.forEach((m, i) => {
    const x = 0.5 + i * 2.25;
    // Dot
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.6, y: 2.38, w: 0.35, h: 0.35,
      fill: { color: m.color }, line: { color: m.color },
    });
    // Year
    s.addText(m.year, {
      x, y: 2.82, w: 1.8, h: 0.35,
      fontSize: 13, color: m.color, bold: true, align: "center", margin: 0,
    });
    // Label
    s.addText(m.label, {
      x, y: 3.18, w: 1.8, h: 0.35,
      fontSize: 11, color: C.white, bold: true, align: "center", margin: 0,
    });
    // Description
    s.addText(m.desc, {
      x, y: 3.55, w: 1.95, h: 0.95,
      fontSize: 8.5, color: C.gray, align: "center", margin: 0,
    });
    // Top label (alternating above/below connector)
    s.addText(m.label.toUpperCase(), {
      x, y: i % 2 === 0 ? 1.6 : 1.2, w: 1.8, h: 0.8,
      fontSize: 8, color: m.color, align: "center", bold: true, charSpacing: 2, margin: 0,
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.75, y: i % 2 === 0 ? 2.38 : 2.38, w: 0, h: i % 2 === 0 ? -0.6 : -0.55,
      line: { color: m.color, width: 1, dashType: "sysDot" },
    });
  });

  accentBar(s);
  slideNumber(s, 6);
}

// ============================================================
// SLIDE 7 — CALL TO ACTION (dark, closing)
// ============================================================
{
  let s = pres.addSlide();
  navyBg(s);

  // Large decorative circle
  s.addShape(pres.shapes.OVAL, {
    x: 6.0, y: -1.2, w: 5.5, h: 5.5,
    fill: { color: C.accent, transparency: 90 }, line: { color: C.accent, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: -1.5, y: 2.8, w: 4.0, h: 4.0,
    fill: { color: C.gold, transparency: 92 }, line: { color: C.gold, width: 0 },
  });

  s.addText("READY TO BUILD THE FUTURE?", {
    x: 0.7, y: 0.7, w: 8.5, h: 0.5,
    fontSize: 10, color: C.accent, bold: true, charSpacing: 4, margin: 0,
  });

  s.addText("Let's partner together.", {
    x: 0.7, y: 1.2, w: 8.5, h: 1.1,
    fontSize: 48, color: C.white, bold: true, margin: 0,
  });

  s.addText("The AI revolution is not a future event — it's happening now.\nOrganizations that act today will define tomorrow's landscape.", {
    x: 0.7, y: 2.5, w: 7.5, h: 0.95,
    fontSize: 13, color: C.iceBlue, margin: 0,
  });

  // CTA button (rectangle styled)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y: 3.65, w: 2.8, h: 0.62,
    fill: { color: C.accent }, line: { color: C.accent },
    rectRadius: 0.08,
  });
  s.addText("Get In Touch →", {
    x: 0.7, y: 3.65, w: 2.8, h: 0.62,
    fontSize: 13, color: C.navy, bold: true, align: "center", valign: "middle", margin: 0,
  });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 3.8, y: 3.65, w: 2.8, h: 0.62,
    fill: { color: C.dark }, line: { color: C.accent, width: 1.2 },
    rectRadius: 0.08,
  });
  s.addText("View Demo →", {
    x: 3.8, y: 3.65, w: 2.8, h: 0.62,
    fontSize: 13, color: C.white, bold: true, align: "center", valign: "middle", margin: 0,
  });

  // Contact
  s.addText("hello@aifuture.io  ·  aifuture.io  ·  @aifuture", {
    x: 0.7, y: 4.6, w: 8, h: 0.35,
    fontSize: 9.5, color: C.gray, margin: 0,
  });

  accentBar(s);
  slideNumber(s, 7);
}

// ============================================================
// WRITE FILE
// ============================================================
const outputPath = "./Future_of_AI_Deck.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log("✅  Presentation generated successfully!");
  console.log(`📁  Saved to: ${outputPath}`);
  console.log(`📊  Slides: 7`);
  console.log(`🎨  Theme: Midnight Executive (Navy + Ice Blue + White)`);
  console.log("\nSlide Summary:");
  console.log("  1. Title Slide — The Future of Artificial Intelligence");
  console.log("  2. Agenda — 5-item structured agenda");
  console.log("  3. Market Landscape — Big stat callouts ($1.8T, 73%, 300M+)");
  console.log("  4. Key Trends — Agentic AI, Multimodal, Edge, Safety");
  console.log("  5. Industry Impact — Healthcare, Finance, Education, Manufacturing");
  console.log("  6. Vision — 4-point timeline (2024→2028)");
  console.log("  7. Call to Action — CTA buttons + contact");
}).catch(err => {
  console.error("❌  Error generating presentation:", err);
  process.exit(1);
});
