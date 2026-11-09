import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = join(process.env.HOME, ".claude/skills/anatomy");
const k = await import(join(SKILL, "kit/iso-kit.mjs"));
const { kitScript } = await import(join(SKILL, "scripts/inline-kit.mjs"));
const { HALLS, PROTOTYPES, sizeOf } = await import("./halls.mjs");

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const strip = (file) => readFileSync(join(HERE, file), "utf8").replace(/^export /gm, "");

const CSS = `
.mk-controls{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 14px}
.mk-group{display:flex;flex-wrap:wrap;gap:6px}
.mk-controls button{font:11px var(--anatomy-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--anatomy-text);background:transparent;border:1px solid var(--anatomy-lo);padding:5px 10px;cursor:pointer}
.mk-controls button[aria-pressed="true"]{color:var(--anatomy-strong);border-color:var(--anatomy-hi)}
.mk-controls button:focus-visible{outline:1px solid var(--anatomy-hi);outline-offset:2px}
.iso-stage{touch-action:pan-y;cursor:grab;user-select:none}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-mid);outline-offset:4px}
.mk-photo{margin:10px 0 0;font:11px var(--anatomy-mono);letter-spacing:.06em}
.mk-photo a{color:var(--anatomy-strong)}
#table{margin-top:20px;overflow-x:auto}
#table table{border-collapse:collapse;width:100%;font-size:12.5px;font-variant-numeric:tabular-nums}
#table th,#table td{padding:6px 10px;text-align:left;border-bottom:1px solid var(--anatomy-faint);white-space:nowrap}
#table thead th{color:var(--anatomy-muted);font:10.5px var(--anatomy-mono);letter-spacing:.08em;text-transform:uppercase}
#table tbody th{color:var(--anatomy-strong);font-weight:500}
#table .mk-columns{margin:10px 0 0;font:11px var(--anatomy-mono);color:var(--anatomy-muted)}
#table tr[data-hall]{cursor:pointer}
#table tr[aria-selected="true"]{background:var(--anatomy-shade-2)}
#table tfoot th,#table tfoot td{color:var(--anatomy-strong);border-bottom:0}
`;

const protoButtons = Object.entries(PROTOTYPES)
  .map(([id, box]) => `<button type="button" data-proto-btn="${id}" title="${sizeOf(box)}">${box.label}</button>`)
  .join("");
const hallButtons = Object.entries(HALLS)
  .map(([id, hall]) => `<button type="button" data-hall-btn="${id}">${hall.name}</button>`)
  .join("");

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Mailboxes per hallway",
  hint: "Drag to turn · ← → keys",
  readout: "",
  keys: [
    { mark: "raised", label: "Box of the hall's own columns" },
    { mark: "lit", label: "Box of a neighbouring column (hall full)" },
    { mark: "dashed", label: "Cut-away wall, boxes still shown" },
  ],
  caption:
    "Box sizes: " + Object.values(PROTOTYPES).map((box) => `${box.label} ${sizeOf(box)}`).join(" · ") + ". Boxes sit on bare wall between 0.90 and 1.50 m (B20 and C30 blocs are 1.45 m tall, top at 1.50 m, kept 30 cm from any radiator; Vincent blocs are 1.20 m tall, base at 0.56 m, as in the hall photos), 10 cm clear of every door, planter, mirror, interphone and cabinet. Hall sizes and wall segments come from hand-drawn plans and are estimates (mockup/halls.mjs). Screen units are centimetres.",
  body: `<div class="mk-controls"><div class="mk-group" role="group" aria-label="Hall">${hallButtons}</div><div class="mk-group" role="group" aria-label="Mailbox prototype">${protoButtons}<button type="button" data-turn>Turn 90°</button></div></div><div class="iso-stage" tabindex="0" role="img" aria-label="Hall view: arrow keys turn it"></div><p class="mk-photo" hidden></p><div id="table"></div>`,
});

const script = `${kitScript()}\n${strip("halls.mjs")}\n${strip("live.js")}`;
const page = k.pageHtml({ title: "Mailboxes per hallway", theme, body, script, width: 980 }).replace("</style>", `${CSS}</style>`);
const name = theme === "light" ? "mailboxes-light.html" : "mailboxes.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name);
