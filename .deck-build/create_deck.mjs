import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const skillDir = "/Users/aadishkumar/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const workspaceDir = "/Users/aadishkumar/Desktop/Hackathon";
const buildDir = path.join(workspaceDir, ".deck-build");
const outputDir = path.join(workspaceDir, "presentation-output");
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);

const font = resolvePresentationFont({ fontFamily: "Aptos" });
const mono = resolvePresentationFont({ fontFamily: "Aptos Mono" });
const ppt = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = { bg: "#0A0C0F", panel: "#131820", line: "#303A46", text: "#F0F4F7", muted: "#9AA6B5", dim: "#657181", cyan: "#9BC4D6", mint: "#7DB89D", amber: "#D3AF70", coral: "#C77984", violet: "#9B9FBE" };
const screenshot = new Uint8Array(await fs.readFile(path.join(buildDir, "product-home.png")));

function addRect(slide, x, y, w, h, fill = C.panel, line = "none", radius = "rounded-xl") {
  return slide.shapes.add({ geometry: "roundRect", position: { left: x, top: y, width: w, height: h }, fill, line: { style: "solid", fill: line, width: line === "none" ? 0 : 1 }, borderRadius: radius });
}
function addText(slide, text, x, y, w, h, size = 20, color = C.text, opts = {}) {
  const s = slide.shapes.add({ geometry: "textbox", position: { left: x, top: y, width: w, height: h }, fill: "none", line: { fill: "none", width: 0 } });
  s.text = text;
  s.text.style = { typeface: opts.mono ? mono : font, fontSize: size, color, bold: opts.bold ?? false, alignment: opts.align ?? "left", autoFit: "shrinkText", breakLine: false, verticalAlignment: opts.valign ?? "top", italic: opts.italic ?? false };
  return s;
}
function base(title, number, subtitle = "") {
  const slide = ppt.slides.add();
  slide.background.fill = C.bg;
  slide.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 11, height: 720 }, fill: C.cyan, line: { fill: "none", width: 0 } });
  addText(slide, String(number).padStart(2, "0"), 72, 42, 80, 24, 12, C.cyan, { mono: true, bold: true });
  addText(slide, title, 72, 72, 920, 54, 32, C.text, { bold: true });
  if (subtitle) addText(slide, subtitle, 72, 132, 930, 30, 16, C.muted);
  addText(slide, "DEVOPS COPILOT  |  HACKATHON PRESENTATION", 72, 684, 430, 18, 9, C.dim, { mono: true });
  addText(slide, String(number).padStart(2, "0"), 1160, 684, 48, 18, 9, C.dim, { mono: true, align: "right" });
  return slide;
}
function note(slide, say, visual, layout) {
  slide.speakerNotes.textFrame.setText(`Say: ${say}\n\nVisual: ${visual}\n\nLayout: ${layout}`);
}
function line(slide, x, y, w, color = C.line, h = 1) { slide.shapes.add({ geometry: "rect", position: { left: x, top: y, width: w, height: h }, fill: color, line: { fill: "none", width: 0 } }); }
function step(slide, x, y, n, label, accent = C.cyan) {
  slide.shapes.add({ geometry: "ellipse", position: { left: x, top: y, width: 42, height: 42 }, fill: C.panel, line: { style: "solid", fill: accent, width: 2 } });
  addText(slide, n, x, y + 10, 42, 18, 11, accent, { mono: true, bold: true, align: "center" });
  addText(slide, label, x - 35, y + 54, 112, 34, 13, C.text, { bold: true, align: "center" });
}

// 1
{
  const s = ppt.slides.add(); s.background.fill = C.bg;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 11, height: 720 }, fill: C.cyan, line: { fill: "none", width: 0 } });
  addText(s, "DEVOPS COPILOT", 76, 82, 520, 34, 16, C.cyan, { mono: true, bold: true });
  addText(s, "Evidence-led incident response\nwith a human approval gate", 76, 132, 600, 150, 48, C.text, { bold: true });
  addText(s, "Investigate the signal, control the risk, verify the recovery.", 76, 306, 520, 42, 22, C.muted);
  addText(s, "Autonomous incident response  |  Hackathon 2026", 76, 570, 420, 22, 13, C.dim, { mono: true });
  s.images.add({ blob: screenshot, contentType: "image/png", alt: "DevOps Copilot product interface", fit: "contain", position: { left: 700, top: 106, width: 500, height: 450 }, geometry: "roundRect", borderRadius: "rounded-xl" });
  addText(s, "LIVE PRODUCT INTERFACE", 700, 572, 300, 16, 10, C.dim, { mono: true });
  note(s, "DevOps Copilot helps an operator move from a production alert to a verified recovery. The important point is control: AI investigates, but people still authorize production changes.", "Actual product screenshot, captured from the project UI.", "Minimal cover. Title on the left, live product on the right.");
}

// 2
{
  const s = base("The incident-response problem", 2, "Production incidents demand decisions before teams have a coherent picture.");
  const signals = [["Health", C.cyan], ["Logs", C.amber], ["Deploys", C.violet], ["Config", C.coral], ["History", C.mint]];
  signals.forEach(([label, color], i) => { addRect(s, 86, 210 + i * 64, 148, 42, C.panel, color); addText(s, label, 104, 222 + i * 64, 112, 18, 15, color, { bold: true }); });
  signals.forEach((_, i) => line(s, 235, 231 + i * 64, 135, C.line, 2));
  addRect(s, 370, 246, 270, 176, "#10151B", C.line); addText(s, "Fragmented evidence", 405, 280, 200, 30, 24, C.text, { bold: true, align: "center" }); addText(s, "Different tools tell partial stories.\nOperators must correlate them under pressure.", 410, 330, 190, 60, 15, C.muted, { align: "center" });
  line(s, 640, 334, 120, C.line, 2); addRect(s, 760, 246, 360, 176, "#1B1518", C.coral); addText(s, "Risky decision window", 800, 280, 280, 30, 24, C.coral, { bold: true, align: "center" }); addText(s, "A fast remediation can reduce impact.\nAn unsafe remediation can deepen it.", 810, 330, 260, 56, 15, C.muted, { align: "center" });
  note(s, "During an incident, the team has health data, logs, deployment history and configuration changes, but no shared evidence trail. The next decision can change production, so speed alone is not enough.", "Signal sources converge into a fragmented-evidence problem and a risky-decision window.", "Left-to-right flow. Keep the attention on the tension between urgency and safety.");
}

// 3
{
  const s = base("Where existing approaches fall short", 3, "Alerting platforms, ticket workflows, and generic AI assistants each solve only part of the response loop.");
  const cols = [
    ["Alerting & dashboards", "Detect symptoms\nSurface metrics\nHand investigation to people", C.cyan],
    ["Runbooks & tickets", "Standardize process\nPreserve history\nRely on manual correlation", C.amber],
    ["Generic AI assistants", "Summarize evidence\nSuggest next steps\nLack an authorization boundary", C.violet]
  ];
  cols.forEach(([title, body, color], i) => { const x = 90 + i * 370; addRect(s, x, 230, 300, 260, C.panel, C.line); addText(s, title, x + 24, 258, 250, 32, 21, color, { bold: true }); line(s, x + 24, 308, 246, color, 2); addText(s, body, x + 24, 336, 242, 104, 16, C.muted); });
  addText(s, "Missing layer: one evidence trail that connects diagnosis, risk policy, human approval, remediation, and proof of recovery.", 116, 548, 1048, 40, 20, C.text, { bold: true, align: "center" });
  note(s, "The issue is not a lack of tools. It is that the tools are disconnected. Alerting detects, runbooks guide, and AI can summarize, but the operating team still has to create the trusted chain of evidence and approval.", "Three-column comparison with one missing-layer statement.", "Use a calm comparison layout. The conclusion sits alone at the bottom.");
}

// 4
{
  const s = base("A controlled response loop", 4, "DevOps Copilot combines evidence collection with a deterministic approval boundary.");
  const x = [105, 435, 765]; const data = [["AI investigates", "Read-only tools collect and correlate evidence.", C.cyan], ["Policy evaluates", "Confidence and risk gates decide whether action is eligible.", C.amber], ["People authorize", "Qualified operators approve, reject, or follow a manual runbook.", C.mint]];
  data.forEach(([title, body, color], i) => { addRect(s, x[i], 240, 270, 210, C.panel, color); addText(s, `0${i+1}`, x[i] + 26, 266, 36, 20, 12, color, { mono: true, bold: true }); addText(s, title, x[i] + 26, 306, 210, 30, 22, C.text, { bold: true }); addText(s, body, x[i] + 26, 350, 210, 60, 15, C.muted); if (i < 2) { line(s, x[i] + 270, 344, 60, C.line, 2); } });
  addText(s, "Verified recovery and an append-only audit record close the loop.", 170, 530, 900, 34, 22, C.text, { bold: true, align: "center" });
  note(s, "Our solution separates responsibilities. The AI investigates with read-only tools. Policy checks confidence and risk. A qualified operator chooses whether to approve, reject, or use the manual runbook. The system then verifies recovery and preserves the record.", "Three editable responsibility blocks leading to the audit and verification outcome.", "Strong center composition. Highlight the policy and human gates as the differentiator.");
}

// 5
{
  const s = base("What the product delivers", 5, "The demo focuses on a complete response loop rather than a single AI summary.");
  const features = [
    ["Evidence correlation", "Health, logs, deployment, config, history, state"],
    ["Confidence gate", "High-confidence evidence before production action"],
    ["Approval controls", "Qualified roles, reason, approval history"],
    ["Runbook context", "Why this action and manual recovery steps"],
    ["Verified recovery", "Metrics check after remediation"],
    ["Durable ledger", "Searchable incidents, notifications, audit events"]
  ];
  features.forEach(([t, b], i) => { const col = i % 2; const row = Math.floor(i / 2); const x = 94 + col * 560; const y = 205 + row * 118; addText(s, `0${i+1}`, x, y, 42, 20, 11, C.cyan, { mono: true, bold: true }); addText(s, t, x + 58, y - 2, 260, 26, 19, C.text, { bold: true }); addText(s, b, x + 58, y + 30, 420, 36, 14, C.muted); line(s, x + 58, y + 82, 430, C.line); });
  note(s, "These are the product moments we want the judges to see: a complete evidence trail, a clear confidence gate, human approval controls, runbook explanation, verification, and a durable incident ledger.", "Six capability rows with short proof points.", "Use two balanced columns with generous whitespace.");
}

// 6
{
  const s = base("Major incident response process", 6, "A simple flow keeps the demo understandable in seconds.");
  const labels = ["Detect", "Investigate", "Explain", "Gate", "Authorize", "Verify"]; const colors = [C.coral, C.cyan, C.violet, C.amber, C.mint, C.mint];
  labels.forEach((label, i) => { step(s, 102 + i * 180, 300, String(i + 1), label, colors[i]); if (i < labels.length - 1) line(s, 144 + i * 180, 321, 138, C.line, 2); });
  addText(s, "Alert", 100, 450, 120, 20, 12, C.muted, { align: "center" }); addText(s, "Read-only evidence", 262, 450, 160, 20, 12, C.muted, { align: "center" }); addText(s, "Root cause + why", 442, 450, 160, 20, 12, C.muted, { align: "center" }); addText(s, "Confidence + risk", 622, 450, 160, 20, 12, C.muted, { align: "center" }); addText(s, "Approval / reject / manual", 802, 450, 170, 20, 12, C.muted, { align: "center" }); addText(s, "Recovery + audit", 982, 450, 160, 20, 12, C.muted, { align: "center" });
  note(s, "This is the full response path. The agent never crosses the authorization boundary during investigation. The flow becomes actionable only after the policy gate and a human decision. Verification makes recovery an observed result rather than an assumption.", "Six-stage process diagram with numbered nodes.", "Horizontal timeline. Use this as the central visual explanation.");
}

// 7
{
  const s = base("Technology and architecture", 7, "A modular React and FastAPI system connects an agent workflow to controlled remediation.");
  const layers = [
    ["Product interface", "React + Vite\nIncident console, guided demo, records", C.cyan],
    ["Application API", "FastAPI\nTyped remediation request and policy endpoints", C.violet],
    ["Investigation engine", "Gemini tool agent\nDeterministic fallback when provider is unavailable", C.amber],
    ["Control & evidence", "Read-only tools, risk engine, verifier, SQLite incident ledger", C.mint]
  ];
  layers.forEach(([t, b, c], i) => { const y = 190 + i * 100; addRect(s, 170, y, 760, 70, C.panel, C.line); addText(s, t, 202, y + 16, 210, 24, 18, c, { bold: true }); addText(s, b, 438, y + 15, 440, 38, 14, C.muted); if (i < layers.length - 1) line(s, 548, y + 70, 2, 30, C.line, 2); });
  addText(s, "Safety boundary", 990, 288, 160, 22, 13, C.amber, { mono: true, bold: true, align: "center" }); addRect(s, 980, 324, 190, 112, "#171516", C.amber); addText(s, "AI never executes\nproduction change", 1000, 352, 150, 50, 18, C.text, { bold: true, align: "center" });
  note(s, "The architecture stays modular. React presents the product. FastAPI exposes the workflow. The agent uses read-only tools, with a deterministic fallback for demo resilience. The risk engine, verifier and SQLite ledger provide the controlled system of record.", "Four-layer editable architecture plus a visible safety boundary.", "Vertical stack on the left and safety statement on the right.");
}

// 8
{
  const s = base("The safety boundary is the USP", 8, "The project treats AI as an investigator within an explicit control system.");
  addText(s, "AI authority", 145, 204, 340, 32, 24, C.cyan, { bold: true, align: "center" }); addText(s, "System authority", 785, 204, 340, 32, 24, C.amber, { bold: true, align: "center" });
  addRect(s, 130, 255, 380, 242, C.panel, C.cyan); addText(s, "Read evidence\nCorrelate signals\nExplain root cause\nRecommend action", 172, 304, 296, 132, 20, C.text, { bold: true, align: "center" });
  addRect(s, 770, 255, 380, 242, "#171516", C.amber); addText(s, "Apply confidence policy\nClassify risk\nRequire role-based approval\nVerify recovery\nAppend audit event", 812, 288, 296, 170, 19, C.text, { bold: true, align: "center" });
  line(s, 510, 375, 260, C.line, 3); addRect(s, 568, 340, 144, 68, C.bg, C.amber); addText(s, "POLICY\nGATE", 580, 354, 120, 34, 13, C.amber, { mono: true, bold: true, align: "center" });
  note(s, "Our core innovation is governance around the model. AI can inspect and recommend, but the system owns the confidence threshold, risk classification, role check, idempotent execution and recovery verification. That makes the demo more credible than an AI chatbot that can simply call an action.", "Two authority zones separated by a policy gate.", "Symmetrical composition. Let the policy gate carry the message.");
}

// 9
{
  const s = base("The live demo experience", 9, "The strongest visual moment is a guided incident that makes the safety story visible.");
  s.images.add({ blob: screenshot, contentType: "image/png", alt: "DevOps Copilot home page", fit: "contain", position: { left: 80, top: 190, width: 610, height: 390 }, geometry: "roundRect", borderRadius: "rounded-xl" });
  const demo = [["01", "Launch the 90-sec demo", C.cyan], ["02", "Review evidence and root cause", C.violet], ["03", "See confidence, risk, and runbook", C.amber], ["04", "Approve, reject, or remediate manually", C.mint], ["05", "Verify recovery and review the ledger", C.mint]];
  demo.forEach(([n, t, c], i) => { const y = 196 + i * 72; addText(s, n, 760, y, 42, 20, 12, c, { mono: true, bold: true }); addText(s, t, 816, y - 2, 350, 28, 17, C.text, { bold: true }); line(s, 816, y + 38, 300, C.line); });
  note(s, "For the live demo, I will launch the database regression scenario. The audience immediately sees a guided path. We investigate, explain the evidence, show the confidence and risk gate, make a human choice, and end with verified recovery and an audit record.", "Actual product screenshot plus five demo beats.", "Screenshot occupies the left side. The exact talk track sits on the right.");
}

// 10
{
  const s = base("Impact and scalability", 10, "The product targets teams that need faster understanding without surrendering production control.");
  const users = [["On-call SRE", "One evidence trail during a high-pressure incident"], ["Incident Commander", "A visible approval boundary and ownership record"], ["Platform Team", "A searchable ledger for review and learning"]];
  users.forEach(([t, b], i) => { const y = 205 + i * 92; addText(s, t, 118, y, 230, 26, 20, C.text, { bold: true }); addText(s, b, 376, y + 2, 420, 26, 15, C.muted); line(s, 118, y + 50, 680, C.line); });
  addText(s, "Scale path", 872, 206, 170, 28, 22, C.cyan, { bold: true }); addText(s, "Replace simulation adapters with\nmonitoring, deployment, and\nnotification integrations.\n\nPersist incident records in\nproduction-grade shared storage.", 872, 258, 270, 160, 17, C.muted);
  addText(s, "Expected operational value must be validated with a pilot. The prototype demonstrates the workflow and its safety controls, not performance claims.", 120, 552, 980, 44, 15, C.amber, { italic: true, align: "center" });
  note(s, "The immediate users are the people running incidents. The product gives them a shared evidence trail, a concrete approval record and a durable ledger. For scale, the simulation adapters map directly to real monitoring, deployment and notification systems. Any measurable improvement needs a real pilot, so we do not claim numbers here.", "Target user roles and a practical scale path. Include visible disclosure on unvalidated impact.", "One narrative: who benefits, then how it scales.");
}

// 11
{
  const s = base("Roadmap to production", 11, "The demo architecture points to clear next steps without overstating current integrations.");
  const road = [["Next", "Connect live observability and deployment systems\nAdd real Slack, Teams, PagerDuty, and email adapters"], ["Then", "Deploy shared database storage\nAdd sign-in, RBAC, and organization-specific runbooks"], ["Later", "Model service dependencies from live topology\nAdd post-incident learning and evaluation workflows"]];
  road.forEach(([t, b], i) => { const x = 100 + i * 370; addText(s, t, x, 222, 200, 30, 23, [C.cyan, C.amber, C.mint][i], { bold: true }); line(s, x, 270, 275, [C.cyan, C.amber, C.mint][i], 3); addText(s, b, x, 306, 278, 95, 17, C.muted); });
  addText(s, "Current prototype: simulated infrastructure, simulated notification adapters, durable local ledger, and external-integration-ready interfaces.", 148, 525, 980, 36, 18, C.text, { bold: true, align: "center" });
  note(s, "The roadmap is deliberately realistic. First we connect the adapters to live signals and notification systems. Next we add identity, shared storage and organization-specific controls. Later we can learn from post-incident records and map dependencies from real topology data.", "Three-horizon roadmap with one clear statement of current prototype scope.", "Use simple vertical columns, no speculative metrics.");
}

// 12
{
  const s = ppt.slides.add(); s.background.fill = C.bg;
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: 11, height: 720 }, fill: C.mint, line: { fill: "none", width: 0 } });
  addText(s, "DEVOPS COPILOT", 92, 100, 500, 28, 16, C.mint, { mono: true, bold: true });
  addText(s, "Fast investigation.\nControlled action.\nVerified recovery.", 92, 160, 760, 180, 54, C.text, { bold: true });
  addText(s, "The takeaway: use AI to accelerate understanding while deterministic policy and human approval protect production change.", 96, 390, 720, 58, 22, C.muted);
  addRect(s, 900, 166, 220, 250, C.panel, C.mint); addText(s, "READ\nEVIDENCE", 936, 210, 148, 44, 21, C.cyan, { bold: true, align: "center" }); addText(s, "GATE\nRISK", 936, 285, 148, 44, 21, C.amber, { bold: true, align: "center" }); addText(s, "PROVE\nRECOVERY", 936, 360, 148, 44, 21, C.mint, { bold: true, align: "center" });
  addText(s, "Thank you", 96, 604, 260, 30, 18, C.dim, { mono: true });
  note(s, "DevOps Copilot turns an incident into a controlled, explainable response loop. It keeps people in control of production changes while giving them the speed and clarity of AI-assisted investigation. Thank you.", "Closing statement with a three-word safety motif.", "Minimal final slide. Pause after the takeaway before inviting questions.");
}

await fs.mkdir(outputDir, { recursive: true });
const candidate = path.join(buildDir, "DevOps_Copilot_Hackathon_Deck_candidate.pptx");
await (await PresentationFile.exportPptx(ppt)).save(candidate);

const finalPath = path.join(outputDir, "DevOps_Copilot_Hackathon_Presentation_v2.pptx");
const result = await finalizePresentation({
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath: candidate,
  finalPath,
  pythonExecutable: "/Users/aadishkumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [font, mono] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, "presentation-validation-v2.json")
});

const montage = await ppt.export({ format: "webp", montage: true, scale: 1 });
await fs.writeFile(path.join(buildDir, "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));
for (let i = 0; i < ppt.slides.items.length; i++) {
  const png = await ppt.export({ slide: ppt.slides.items[i], format: "png", scale: 1 });
  await fs.writeFile(path.join(buildDir, `slide-${i + 1}.png`), new Uint8Array(await png.arrayBuffer()));
}
console.log(JSON.stringify({ finalPath, result }, null, 2));
