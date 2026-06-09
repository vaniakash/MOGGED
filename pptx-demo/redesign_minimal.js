// ================================================================
// REDESIGN — "Future of AI" — Industry-Grade Minimal Clean
// Design Language: McKinsey × Apple × Linear
// Palette: Off-white background, near-black text, single indigo accent
// No gradients. No decorative blobs. Pure structure, whitespace & type.
// ================================================================

const pptxgen = require("pptxgenjs");

let pres     = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.author  = "AI Strategy Team";
pres.title   = "The Future of AI — 2026";

// ── DESIGN TOKENS ───────────────────────────────────────────────
const T = {
  // Backgrounds
  bg:          "FAFAFA",   // near-white canvas
  bgDark:      "0F1117",   // near-black (title + CTA slides)
  surface:     "FFFFFF",   // pure white card surface
  surfaceDark: "1A1D27",   // dark card surface

  // Text
  ink:         "0F1117",   // primary text on light
  inkLight:    "FFFFFF",   // primary text on dark
  muted:       "6B7280",   // secondary / caption text
  mutedDark:   "9CA3AF",   // secondary text on dark bg

  // Accent — single indigo, used sparingly
  accent:      "4F46E5",   // indigo-600
  accentLight: "EEF2FF",   // indigo-50 (light tint for tags)

  // Borders
  border:      "E5E7EB",   // light rule lines
  borderDark:  "2D3142",   // dark rule lines

  // Data colours (for charts/categories)
  d1: "4F46E5",  // indigo
  d2: "059669",  // emerald
  d3: "D97706",  // amber
  d4: "DC2626",  // red
};

const FONT = "Calibri";  // clean system font, no install needed

// ── SHARED HELPERS ──────────────────────────────────────────────

// Full-slide background fill
function fillBg(s, color) {
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color }, line: { color },
  });
}

// Thin horizontal rule
function rule(s, x, y, w, color = T.border) {
  s.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: 0.75 },
  });
}

// Small ALL-CAPS category label
function label(s, text, x, y, color = T.accent) {
  s.addText(text, {
    x, y, w: 8, h: 0.28,
    fontSize: 8, color, bold: true,
    charSpacing: 3, fontFace: FONT, margin: 0,
  });
}

// Slide number — bottom right, always
function pageNum(s, n, darkBg = false) {
  s.addText(`${String(n).padStart(2, "0")}`, {
    x: 9.2, y: 5.28, w: 0.6, h: 0.22,
    fontSize: 7.5, color: darkBg ? T.mutedDark : T.muted,
    align: "right", fontFace: FONT, margin: 0,
  });
}

// ================================================================
// SLIDE 1 — TITLE  (dark minimal)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bgDark);

  // Left accent bar (4px wide, full height)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.055, h: 5.625,
    fill: { color: T.accent }, line: { color: T.accent },
  });

  // Thin horizontal rule through the middle
  rule(s, 0.55, 2.9, 8.9, T.borderDark);

  // Label
  label(s, "PITCH DECK  /  2026", 0.55, 0.52, T.accent);

  // Main title — extra-large, tight
  s.addText("The Future of", {
    x: 0.55, y: 0.82, w: 9, h: 1.05,
    fontSize: 54, color: T.inkLight, bold: true,
    fontFace: FONT, margin: 0, charSpacing: -1,
  });
  s.addText("Artificial Intelligence", {
    x: 0.55, y: 1.82, w: 9.2, h: 0.85,
    fontSize: 36, color: T.accent, bold: false,
    fontFace: FONT, margin: 0,
  });

  // Subtitle below rule
  s.addText(
    "How AI is reshaping industries, economies,\nand human potential — a 2026 outlook.",
    {
      x: 0.55, y: 3.08, w: 6.5, h: 0.9,
      fontSize: 13, color: T.mutedDark,
      fontFace: FONT, margin: 0, lineSpacingMultiple: 1.3,
    }
  );

  // Right-side: edition tag
  s.addText("Edition 2026", {
    x: 8.1, y: 3.08, w: 1.7, h: 0.32,
    fontSize: 8.5, color: T.mutedDark, align: "right",
    fontFace: FONT, margin: 0,
  });

  // Bottom strip
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.35, w: 10, h: 0.275,
    fill: { color: T.accent }, line: { color: T.accent },
  });
  s.addText("aifuture.io", {
    x: 0.55, y: 5.35, w: 4, h: 0.275,
    fontSize: 8, color: T.inkLight,
    fontFace: FONT, margin: 0, valign: "middle",
  });
}

// ================================================================
// SLIDE 2 — TABLE OF CONTENTS  (light)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bg);

  // Top header band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.9,
    fill: { color: T.bgDark }, line: { color: T.bgDark },
  });
  s.addText("CONTENTS", {
    x: 0.55, y: 0, w: 9, h: 0.9,
    fontSize: 10, color: T.accent, bold: true, charSpacing: 4,
    fontFace: FONT, margin: 0, valign: "middle",
  });
  // Slide title on same band, right-aligned
  s.addText("What We Cover", {
    x: 0, y: 0, w: 9.65, h: 0.9,
    fontSize: 10, color: T.mutedDark, align: "right",
    fontFace: FONT, margin: 0, valign: "middle",
  });

  const items = [
    { n: "01", label: "Market Landscape",   sub: "Global adoption, investment scale, and the inflection point" },
    { n: "02", label: "Key Trends — 2026",  sub: "Agentic AI, multimodal models, edge inference, safety" },
    { n: "03", label: "Industry Impact",    sub: "Healthcare · Finance · Education · Manufacturing" },
    { n: "04", label: "Our Vision",         sub: "A 4-stage roadmap toward human-AI symbiosis" },
    { n: "05", label: "Next Steps",         sub: "How to engage, partner, and build together" },
  ];

  items.forEach((item, i) => {
    const y = 1.05 + i * 0.86;

    // Row background (alternate subtle tint)
    if (i % 2 === 0) {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 0.45, y: y - 0.06, w: 9.1, h: 0.76,
        fill: { color: "F3F4F6" }, line: { color: "F3F4F6" },
      });
    }

    // Number — small, indigo
    s.addText(item.n, {
      x: 0.55, y, w: 0.5, h: 0.55,
      fontSize: 11, color: T.accent, bold: true,
      fontFace: FONT, margin: 0,
    });

    // Label
    s.addText(item.label, {
      x: 1.2, y, w: 4, h: 0.3,
      fontSize: 13, color: T.ink, bold: true,
      fontFace: FONT, margin: 0,
    });

    // Sub
    s.addText(item.sub, {
      x: 1.2, y: y + 0.3, w: 7.8, h: 0.25,
      fontSize: 9.5, color: T.muted,
      fontFace: FONT, margin: 0,
    });
  });

  pageNum(s, 2);
}

// ================================================================
// SLIDE 3 — MARKET LANDSCAPE  (light, 3-stat row)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bg);

  label(s, "MARKET LANDSCAPE", 0.55, 0.32);
  s.addText("AI is the defining technology of our era", {
    x: 0.55, y: 0.58, w: 9, h: 0.72,
    fontSize: 30, color: T.ink, bold: true,
    fontFace: FONT, margin: 0, charSpacing: -0.5,
  });
  rule(s, 0.55, 1.38, 8.9);

  // Insight sentence below rule
  s.addText(
    "Three numbers frame the scale of the opportunity — and the urgency to act.",
    {
      x: 0.55, y: 1.52, w: 8.5, h: 0.38,
      fontSize: 11, color: T.muted, fontFace: FONT, margin: 0,
    }
  );

  const stats = [
    { value: "$1.8T",  unit: "USD",  label: "Projected global AI market by 2030",     src: "IDC, 2025" },
    { value: "73%",    unit: "",     label: "Of enterprises actively deploying AI now", src: "McKinsey, 2025" },
    { value: "300M+",  unit: "",     label: "Jobs augmented or transformed by 2028",   src: "WEF, 2025" },
  ];

  stats.forEach((st, i) => {
    const x = 0.55 + i * 3.15;

    // Card — white with subtle shadow (border only in pptxgenjs)
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.05, w: 2.9, h: 2.82,
      fill: { color: T.surface },
      line: { color: T.border, width: 1 },
      shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.06 },
    });

    // Accent top-bar on card
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.05, w: 2.9, h: 0.055,
      fill: { color: T.accent }, line: { color: T.accent },
    });

    // Big stat
    s.addText(st.value, {
      x, y: 2.28, w: 2.9, h: 0.95,
      fontSize: 46, color: T.accent, bold: true,
      fontFace: FONT, align: "center", margin: 0, charSpacing: -1,
    });

    // Unit (if any)
    if (st.unit) {
      s.addText(st.unit, {
        x, y: 3.18, w: 2.9, h: 0.28,
        fontSize: 10, color: T.muted,
        fontFace: FONT, align: "center", margin: 0,
      });
    }

    // Label
    s.addText(st.label, {
      x: x + 0.15, y: st.unit ? 3.44 : 3.18, w: 2.6, h: 0.65,
      fontSize: 10, color: T.ink,
      fontFace: FONT, align: "center", margin: 0, lineSpacingMultiple: 1.25,
    });

    // Source
    s.addText(st.src, {
      x, y: 4.62, w: 2.9, h: 0.22,
      fontSize: 7.5, color: T.muted, italic: true,
      fontFace: FONT, align: "center", margin: 0,
    });
  });

  pageNum(s, 3);
}

// ================================================================
// SLIDE 4 — KEY TRENDS  (2 × 2 grid, light)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bg);

  label(s, "KEY TRENDS — 2026", 0.55, 0.32);
  s.addText("Forces reshaping the AI ecosystem", {
    x: 0.55, y: 0.58, w: 9, h: 0.65,
    fontSize: 30, color: T.ink, bold: true,
    fontFace: FONT, margin: 0,
  });
  rule(s, 0.55, 1.3, 8.9);

  const trends = [
    { tag: "AGENTIC AI",         title: "Autonomous AI agents",      color: T.d1,
      desc: "AI systems that plan, reason, and execute complex multi-step tasks independently — from coding to research to ops." },
    { tag: "MULTIMODAL",         title: "Beyond text — unified AI",  color: T.d2,
      desc: "Models that seamlessly process text, images, audio, video, and code in one unified context window." },
    { tag: "EDGE INFERENCE",     title: "AI moves on-device",        color: T.d3,
      desc: "Powerful models running locally on phones and laptops — private, fast, offline-capable." },
    { tag: "AI SAFETY",          title: "Regulation & alignment",    color: T.d4,
      desc: "EU AI Act, NIST framework, red-teaming, and constitutional AI become enterprise table stakes." },
  ];

  const pos = [
    { x: 0.45, y: 1.48 }, { x: 5.2,  y: 1.48 },
    { x: 0.45, y: 3.3  }, { x: 5.2,  y: 3.3  },
  ];

  trends.forEach((t, i) => {
    const { x, y } = pos[i];

    // Card
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.5, h: 1.65,
      fill: { color: T.surface }, line: { color: T.border, width: 0.75 },
    });

    // Left colour stripe
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.04, h: 1.65,
      fill: { color: t.color }, line: { color: t.color },
    });

    // Tag pill
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.18, y: y + 0.15, w: 1.05, h: 0.24,
      fill: { color: T.accentLight }, line: { color: T.accentLight },
      rectRadius: 0.04,
    });
    s.addText(t.tag, {
      x: x + 0.18, y: y + 0.15, w: 1.05, h: 0.24,
      fontSize: 6.5, color: t.color, bold: true, charSpacing: 1.5,
      fontFace: FONT, align: "center", valign: "middle", margin: 0,
    });

    // Title
    s.addText(t.title, {
      x: x + 0.18, y: y + 0.44, w: 4.15, h: 0.36,
      fontSize: 14, color: T.ink, bold: true,
      fontFace: FONT, margin: 0,
    });

    // Description
    s.addText(t.desc, {
      x: x + 0.18, y: y + 0.82, w: 4.15, h: 0.72,
      fontSize: 9.5, color: T.muted,
      fontFace: FONT, margin: 0, lineSpacingMultiple: 1.3,
    });
  });

  pageNum(s, 4);
}

// ================================================================
// SLIDE 5 — INDUSTRY IMPACT  (full-width row layout)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bg);

  label(s, "INDUSTRY IMPACT", 0.55, 0.32);
  s.addText("Four sectors leading the transformation", {
    x: 0.55, y: 0.58, w: 9, h: 0.65,
    fontSize: 30, color: T.ink, bold: true,
    fontFace: FONT, margin: 0,
  });
  rule(s, 0.55, 1.3, 8.9);

  const sectors = [
    { icon: "⚕",  name: "Healthcare",    color: T.d1,
      kpi: "10× faster drug discovery",
      points: ["AI radiology: 94% diagnostic accuracy", "Personalised treatment at population scale"],
    },
    { icon: "⬡",  name: "Finance",       color: T.d2,
      kpi: "$15B fraud prevented annually",
      points: ["Real-time transaction scoring", "AI-driven portfolio management"],
    },
    { icon: "◎",  name: "Education",     color: T.d3,
      kpi: "40% improvement in outcomes",
      points: ["Adaptive learning pathways per student", "Automated, instant feedback loops"],
    },
    { icon: "◈",  name: "Manufacturing", color: T.d4,
      kpi: "30% reduction in downtime",
      points: [">99% defect detection on assembly lines", "Autonomous supply chain optimisation"],
    },
  ];

  sectors.forEach((sec, i) => {
    const y = 1.45 + i * 0.99;

    // Row separator
    if (i > 0) rule(s, 0.55, y - 0.04, 8.9, T.border);

    // Colour dot
    s.addShape(pres.shapes.OVAL, {
      x: 0.55, y: y + 0.18, w: 0.28, h: 0.28,
      fill: { color: sec.color }, line: { color: sec.color },
    });

    // Sector name
    s.addText(sec.name, {
      x: 1.0, y, w: 2.1, h: 0.38,
      fontSize: 13, color: T.ink, bold: true,
      fontFace: FONT, margin: 0,
    });

    // KPI badge
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: y + 0.42, w: 2.6, h: 0.3,
      fill: { color: T.accentLight }, line: { color: T.accentLight },
      rectRadius: 0.04,
    });
    s.addText(sec.kpi, {
      x: 1.0, y: y + 0.42, w: 2.6, h: 0.3,
      fontSize: 8.5, color: sec.color, bold: true,
      fontFace: FONT, align: "center", valign: "middle", margin: 0,
    });

    // Vertical divider
    s.addShape(pres.shapes.LINE, {
      x: 3.85, y: y + 0.05, w: 0, h: 0.75,
      line: { color: T.border, width: 0.75 },
    });

    // Bullet points
    sec.points.forEach((pt, j) => {
      s.addShape(pres.shapes.RECTANGLE, {
        x: 4.05, y: y + 0.12 + j * 0.36, w: 0.055, h: 0.055,
        fill: { color: sec.color }, line: { color: sec.color },
      });
      s.addText(pt, {
        x: 4.25, y: y + 0.06 + j * 0.36, w: 5.15, h: 0.32,
        fontSize: 10, color: T.ink,
        fontFace: FONT, margin: 0,
      });
    });
  });

  pageNum(s, 5);
}

// ================================================================
// SLIDE 6 — VISION / TIMELINE  (light, horizontal steps)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bg);

  label(s, "OUR VISION", 0.55, 0.32);
  s.addText("A four-stage roadmap to human-AI collaboration", {
    x: 0.55, y: 0.58, w: 9, h: 0.65,
    fontSize: 30, color: T.ink, bold: true,
    fontFace: FONT, margin: 0,
  });
  rule(s, 0.55, 1.3, 8.9);

  // Central connecting line
  s.addShape(pres.shapes.LINE, {
    x: 0.85, y: 2.82, w: 8.35, h: 0,
    line: { color: T.border, width: 1.5 },
  });

  const stages = [
    { year: "2024", name: "Foundation",  color: T.d1,
      desc: "Multimodal era begins. GPT-4, Claude 3, Gemini launch at scale." },
    { year: "2025", name: "Deployment",  color: T.d2,
      desc: "Agentic AI enters enterprise workflows across Fortune 500." },
    { year: "2026", name: "Integration", color: T.d3,
      desc: "AI embedded natively into every product, tool, and process." },
    { year: "2028", name: "Symbiosis",   color: T.d4,
      desc: "Human + AI teams consistently outperform either alone." },
  ];

  stages.forEach((st, i) => {
    const x = 0.55 + i * 2.3;

    // Step number circle
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.3, y: 2.56, w: 0.52, h: 0.52,
      fill: { color: st.color }, line: { color: st.color },
    });
    s.addText(`${i + 1}`, {
      x: x + 0.3, y: 2.56, w: 0.52, h: 0.52,
      fontSize: 11, color: T.inkLight, bold: true,
      fontFace: FONT, align: "center", valign: "middle", margin: 0,
    });

    // Year
    s.addText(st.year, {
      x, y: 1.52, w: 1.8, h: 0.35,
      fontSize: 11, color: T.muted, bold: false,
      fontFace: FONT, align: "center", margin: 0,
    });

    // Stage name
    s.addText(st.name, {
      x, y: 1.85, w: 1.8, h: 0.38,
      fontSize: 14, color: st.color, bold: true,
      fontFace: FONT, align: "center", margin: 0,
    });

    // Vertical connector from name to circle
    s.addShape(pres.shapes.LINE, {
      x: x + 0.56, y: 2.24, w: 0, h: 0.32,
      line: { color: st.color, width: 1 },
    });

    // Description card below line
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 3.22, w: 2.05, h: 1.45,
      fill: { color: T.surface }, line: { color: T.border, width: 0.75 },
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 3.22, w: 2.05, h: 0.04,
      fill: { color: st.color }, line: { color: st.color },
    });
    s.addText(st.desc, {
      x: x + 0.12, y: 3.32, w: 1.82, h: 1.2,
      fontSize: 9.5, color: T.muted,
      fontFace: FONT, margin: 0, lineSpacingMultiple: 1.4,
    });
  });

  pageNum(s, 6);
}

// ================================================================
// SLIDE 7 — CALL TO ACTION  (dark minimal)
// ================================================================
{
  let s = pres.addSlide();
  fillBg(s, T.bgDark);

  // Left accent bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.055, h: 5.625,
    fill: { color: T.accent }, line: { color: T.accent },
  });

  // Divider rule
  rule(s, 0.55, 3.22, 8.9, T.borderDark);

  label(s, "GET STARTED", 0.55, 0.48, T.accent);

  s.addText("Start your AI\njourney today.", {
    x: 0.55, y: 0.75, w: 8.5, h: 1.85,
    fontSize: 50, color: T.inkLight, bold: true,
    fontFace: FONT, margin: 0, charSpacing: -1, lineSpacingMultiple: 1.1,
  });

  s.addText(
    "The organisations that invest now will define the competitive\nlandscape for the next decade. Every week matters.",
    {
      x: 0.55, y: 2.68, w: 7.2, h: 0.72,
      fontSize: 12, color: T.mutedDark,
      fontFace: FONT, margin: 0, lineSpacingMultiple: 1.4,
    }
  );

  // Two CTA items below rule — text-based, no garish buttons
  const ctas = [
    { icon: "→", text: "Book a strategy session", sub: "hello@aifuture.io" },
    { icon: "→", text: "Read the full report",    sub: "aifuture.io/report" },
    { icon: "→", text: "Follow our research",     sub: "@aifuture on X / LinkedIn" },
  ];

  ctas.forEach((c, i) => {
    const x = 0.55 + i * 3.15;
    s.addText(c.icon, {
      x, y: 3.44, w: 0.3, h: 0.3,
      fontSize: 13, color: T.accent, bold: true,
      fontFace: FONT, margin: 0,
    });
    s.addText(c.text, {
      x: x + 0.3, y: 3.42, w: 2.7, h: 0.3,
      fontSize: 11, color: T.inkLight, bold: true,
      fontFace: FONT, margin: 0,
    });
    s.addText(c.sub, {
      x: x + 0.3, y: 3.76, w: 2.7, h: 0.26,
      fontSize: 9, color: T.accent,
      fontFace: FONT, margin: 0,
    });
  });

  // Bottom strip
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.35, w: 10, h: 0.275,
    fill: { color: T.accent }, line: { color: T.accent },
  });
  s.addText("aifuture.io  ·  Confidential & Proprietary  ·  2026", {
    x: 0.55, y: 5.35, w: 9, h: 0.275,
    fontSize: 7.5, color: T.inkLight,
    fontFace: FONT, margin: 0, valign: "middle",
  });
}

// ================================================================
// WRITE
// ================================================================
pres.writeFile({ fileName: "./AI_Deck_MINIMAL_CLEAN.pptx" }).then(() => {
  console.log("\n✅  Minimal clean deck generated!");
  console.log("📁  File: ./AI_Deck_MINIMAL_CLEAN.pptx");
  console.log("🎨  Design: Off-white canvas · Near-black ink · Indigo accent");
  console.log("🔤  Font: Calibri (system font, no install needed)");
  console.log("\n   Slide 01 — Title (dark)");
  console.log("   Slide 02 — Table of Contents (alternating row table)");
  console.log("   Slide 03 — Market Stats (3 white cards, indigo top bar)");
  console.log("   Slide 04 — Key Trends (2×2 grid with left colour stripe)");
  console.log("   Slide 05 — Industry Impact (full-width row layout)");
  console.log("   Slide 06 — Vision Timeline (numbered circles on axis)");
  console.log("   Slide 07 — Call to Action (dark, text-only CTA rows)\n");
}).catch(err => {
  console.error("❌  Error:", err);
  process.exit(1);
});
