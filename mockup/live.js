const VIEW_W = 920, VIEW_H = 540;
const T = 20, WALL_H = 270, FLOOR = 8;
const OUT = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] };
const SIDE_NAME = { N: "north", E: "east", S: "south", W: "west" };
const KINDS_WITHOUT_BODY = new Set(["glass", "door", "stairs"]);

const stage = document.querySelector(".iso-stage");
const readout = document.querySelector("[data-readout]");
const tableBox = document.querySelector("#table");
const still = matchMedia("(prefers-reduced-motion: reduce)");
stage.innerHTML = figureSvg({
  width: VIEW_W,
  height: VIEW_H,
  label: "Cutaway isometric view of one building hallway with mailboxes mounted on its free walls between 0.90 m and 1.50 m.",
  body: '<g id="scene"></g>',
});
const scene = stage.querySelector("#scene");

const ALLOC = Object.fromEntries(Object.keys(PROTOTYPES).map((name) => [name, allocate(name)]));
const state = { hall: "AB", proto: "standard", az: 40, azTarget: 40, base: 40 };

function wallRect(hall, side, at, length, t0, depth) {
  if (side === "N") return { x: at, y: t0, w: length, d: depth, r: 0 };
  if (side === "S") return { x: at, y: hall.d - t0 - depth, w: length, d: depth, r: 0 };
  if (side === "W") return { x: t0, y: at, w: depth, d: length, r: 0 };
  return { x: hall.w - t0 - depth, y: at, w: depth, d: length, r: 0 };
}

function facePoint(side, rect, u, z) {
  if (side === "N") return [rect.x + u * rect.w, rect.y + rect.d, z];
  if (side === "S") return [rect.x + u * rect.w, rect.y, z];
  if (side === "W") return [rect.x + rect.w, rect.y + u * rect.d, z];
  return [rect.x, rect.y + u * rect.d, z];
}

function cameraFor(hall, azimuth) {
  const points = boxCorners({ x: -T, y: -T, w: hall.w + 2 * T, d: hall.d + 2 * T }, -FLOOR, WALL_H);
  let scale = Infinity;
  for (let a = 0; a < 360; a += 15) scale = Math.min(scale, fitProjection(points, VIEW_W, VIEW_H, { pad: 22, azimuth: a }).scale);
  const unit = { origin: [0, 0], scale, azimuth, elevation: 30 };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x), ys = flat.map(([, y]) => y);
  return { ...unit, origin: [VIEW_W / 2 - (Math.min(...xs) + Math.max(...xs)) / 2, VIEW_H / 2 - (Math.min(...ys) + Math.max(...ys)) / 2] };
}

// What a wall segment is made of: a body (unless it is an opening) plus fixtures standing on it.
function fixturesOf(hall, side, kind, at, length) {
  const rect = (t0, depth, from = at, span = length) => wallRect(hall, side, from, span, t0, depth);
  const body = { rect: rect(-T, T), z0: 0, h: WALL_H, tone: "mid", body: true };
  const lintel = { rect: rect(-T, T), z0: 210, h: WALL_H - 210, tone: "mid", body: true };
  const evenly = (count) => Array.from({ length: count }, (_, index) => (index + 1) / (count + 1));
  if (kind === "wall") return [body];
  if (kind === "glass") return [lintel, { rect: rect(-12, 4), z0: 0, h: 210, tone: "faint", vlines: [0.5], hlines: [100] }];
  if (kind === "door" || kind === "stairs") return [lintel, { rect: rect(-12, 5), z0: 0, h: 210, tone: "mid", vlines: [0.5], hlines: [] }];
  if (kind === "radiator") return [body, { rect: rect(0, 12), z0: 12, h: 62, tone: "mid", vlines: evenly(Math.max(3, Math.round(length / 9))) }];
  if (kind === "planter") return [body, { rect: rect(0, 50), z0: 0, h: 45, tone: "mid", vlines: [], hlines: [] }];
  if (kind === "mirror") return [body, { rect: rect(0, 3), z0: 20, h: 180, tone: "faint", vlines: [0.06, 0.94], hlines: [30, 190] }];
  if (kind === "loge") return [body, { rect: rect(0, 4), z0: 95, h: 110, tone: "faint", vlines: [0.5] }, { rect: rect(0, 14), z0: 88, h: 7, tone: "mid" }];
  if (kind === "cabinet") return [body, { rect: rect(0, 8), z0: 0, h: 210, tone: "mid", vlines: [0.5] }];
  if (kind === "lift") return [body, { rect: rect(0, 8), z0: 0, h: 210, tone: "mid", vlines: [0.5, 0.25, 0.75] }];
  const small = rect(0, 6, at + (length - 22) / 2, 22);
  return [body, { rect: small, z0: 110, h: 36, tone: "mid" }];
}

function boxRect(hall, box, slot) {
  const along = slot.at, across = box.d;
  if (slot.side === "N") return { x: along, y: 0, w: box.w, d: across, r: 0 };
  if (slot.side === "S") return { x: along, y: hall.d - across, w: box.w, d: across, r: 0 };
  if (slot.side === "W") return { x: 0, y: along, w: across, d: box.w, r: 0 };
  return { x: hall.w - across, y: along, w: across, d: box.w, r: 0 };
}

function render() {
  const hall = HALLS[state.hall];
  const plan = ALLOC[state.proto];
  const box = plan.box;
  const P = cameraFor(hall, state.az);
  const toward = towardViewer(P);
  const near = (side) => OUT[side][0] * toward[0] + OUT[side][1] * toward[1] > 0.02;
  const depthAt = (rect, z) => depthOf([rect.x + rect.w / 2, rect.y + rect.d / 2, z], P);
  const S = (rect, z0, h, tone, extra = {}) => solidSvg(slabOf(rect, z0, h, P, 2, 0.3), { tone, ...extra });
  const wire = (rect, z0, h, tone = "faint") => {
    const pts = [[rect.x, rect.y], [rect.x + rect.w, rect.y], [rect.x + rect.w, rect.y + rect.d], [rect.x, rect.y + rect.d]];
    return lineSvg(planOutline(rect, z0 + h, P, 1) + planOutline(rect, z0, P, 1) + pts.map(([x, y]) => rise([x, y], z0, z0 + h, P)).join(""), { tone, dashed: true });
  };
  const line3 = (a, b) => segment(a, b, P);

  const out = [];
  const room = { x: 0, y: 0, w: hall.w, d: hall.d, r: 0 };
  out.push(`<path class="iso-halo" d="${haloOf({ x: -T, y: -T, w: hall.w + 2 * T, d: hall.d + 2 * T, r: 0 }, -FLOOR, FLOOR, P)}"/>`);
  out.push(S({ x: -T, y: -T, w: hall.w + 2 * T, d: hall.d + 2 * T, r: 0 }, -FLOOR, FLOOR, "lo"));
  let tiles = "";
  for (let x = 50; x < hall.w; x += 50) tiles += lineOnTop([x, 0], [x, hall.d], 0, P);
  for (let y = 50; y < hall.d; y += 50) tiles += lineOnTop([0, y], [hall.w, y], 0, P);
  out.push(lineSvg(tiles, { tone: "faint" }));
  out.push(lineSvg(planOutline(room, 0, P, 1), { tone: "lo" }));
  out.push(faceTextSvg(topMatrix([hall.w / 2, hall.d / 2 + 12], 0, P, "x"), hall.name.toUpperCase(), { size: 20, tone: "lo", anchor: "middle" }));
  for (const [side, at] of [["N", [hall.w / 2, 38]], ["S", [hall.w / 2, hall.d - 26]], ["W", [24, hall.d / 2]], ["E", [hall.w - 24, hall.d / 2]]]) {
    out.push(faceTextSvg(topMatrix(at, 0, P, "x"), side, { size: 16, tone: "lo", anchor: "middle" }));
  }

  const farBodies = [], farThings = [], nearThings = [], nearBoxes = [];
  const corner = (x, y, nearSide) => ({ rect: { x, y, w: T, d: T, r: 0 }, z0: 0, h: WALL_H, tone: "mid" });
  for (const [cx, cy, sides] of [[-T, -T, "NW"], [hall.w, -T, "NE"], [-T, hall.d, "SW"], [hall.w, hall.d, "SE"]]) {
    const item = corner(cx, cy);
    if (![...sides].every((side) => near(side))) farBodies.push({ depth: depthAt(item.rect, WALL_H / 2), svg: S(item.rect, 0, WALL_H, "mid") });
  }

  for (const side of "NESW") {
    const isNear = near(side);
    if (isNear) {
      const curb = wallRect(hall, side, 0, side === "N" || side === "S" ? hall.w : hall.d, -T, T);
      out.push(S(curb, 0, 6, "lo"));
      const a = side === "N" || side === "S" ? hall.w : hall.d;
      const corners3 = [facePoint(side, wallRect(hall, side, 0, a, 0, 0), 0, 0), facePoint(side, wallRect(hall, side, 0, a, 0, 0), 1, 0), facePoint(side, wallRect(hall, side, 0, a, 0, 0), 1, WALL_H), facePoint(side, wallRect(hall, side, 0, a, 0, 0), 0, WALL_H)];
      out.push(lineSvg(corners3.map((point, index) => line3(point, corners3[(index + 1) % 4])).join(""), { tone: "faint", dashed: true }));
      let cursor = 0;
      for (const [kind, length] of hall.walls[side]) {
        if (kind === "wall") {
          const strip = wallRect(hall, side, cursor, length, 0, 0);
          const band = [[0, BAND[0]], [1, BAND[0]], [1, BAND[1]], [0, BAND[1]]].map(([u, z]) => facePoint(side, strip, u, z));
          out.push(lineSvg(band.map((point, index) => line3(point, band[(index + 1) % 4])).join(""), { tone: "mid", dashed: true }));
        }
        cursor += length;
      }
    }
    let at = 0;
    for (const [kind, length] of hall.walls[side]) {
      for (const item of fixturesOf(hall, side, kind, at, length)) {
        if (isNear) {
          if (!item.body) nearThings.push({ depth: depthAt(item.rect, item.z0 + item.h / 2), svg: wire(item.rect, item.z0, item.h) });
          continue;
        }
        let svg = S(item.rect, item.z0, item.h, item.tone);
        let marks = "";
        for (const u of item.vlines || []) marks += line3(facePoint(side, item.rect, u, item.z0 + 2), facePoint(side, item.rect, u, item.z0 + item.h - 2));
        for (const z of item.hlines || []) marks += line3(facePoint(side, item.rect, 0.04, z), facePoint(side, item.rect, 0.96, z));
        if (marks) svg += lineSvg(marks, { tone: "lo" });
        (item.body ? farBodies : farThings).push({ depth: depthAt(item.rect, item.z0 + item.h / 2), svg });
      }
      at += length;
    }
  }

  const addBox = (rect, side, z0, h, w, guest) => {
    let svg = S(rect, z0, h, guest ? "lit" : "hi", { lit: guest });
    if (!near(side)) {
      const inset = Math.min(1.6, h * 0.12, w * 0.06);
      const [u0, u1] = [inset / w, 1 - inset / w];
      const [z1, z2] = [z0 + inset, z0 + h - inset];
      const frame = [[u0, z1], [u1, z1], [u1, z2], [u0, z2]].map(([u, z]) => facePoint(side, rect, u, z));
      svg += lineSvg(frame.map((point, i) => line3(point, frame[(i + 1) % 4])).join(""), { tone: "lo" });
      svg += lineSvg(line3(facePoint(side, rect, 0.2, z0 + h * 0.72), facePoint(side, rect, 0.8, z0 + h * 0.72)), { tone: "mid" });
      svg += dotsSvg([iso(facePoint(side, rect, 0.82, z0 + h * 0.36), P)], { size: 0.5 });
    }
    (near(side) ? nearBoxes : farThings).push({ depth: depthAt(rect, z0 + h / 2), svg });
  };

  if (box.blocs) {
    for (const bloc of plan.blocs[state.hall]) {
      const { def, rows, cell, h, z0, boxes } = blocGeometry(bloc);
      const guest = bloc.from !== state.hall;
      const rect = boxRect(hall, { w: def.w, d: def.d }, bloc);
      let svg = S(rect, z0, h, guest ? "lit" : "hi", { lit: guest });
      if (!near(bloc.side)) {
        let marks = "";
        for (let c = 1; c < def.cols; c++) marks += line3(facePoint(bloc.side, rect, c / def.cols, z0 + 1), facePoint(bloc.side, rect, c / def.cols, z0 + h - 1));
        for (let r = 1; r < rows; r++) marks += line3(facePoint(bloc.side, rect, 0.02, z0 + r * cell), facePoint(bloc.side, rect, 0.98, z0 + r * cell));
        svg += lineSvg(marks, { tone: "lo" });
        let spare = "";
        for (let index = bloc.used; index < boxes; index++) {
          const [row, column] = [Math.floor(index / def.cols), index % def.cols];
          const [u0, u1] = [(column + 0.2) / def.cols, (column + 0.8) / def.cols];
          spare += line3(facePoint(bloc.side, rect, u0, z0 + (row + 0.25) * cell), facePoint(bloc.side, rect, u1, z0 + (row + 0.75) * cell));
        }
        if (spare) svg += lineSvg(spare, { tone: "faint" });
      }
      (near(bloc.side) ? nearBoxes : farThings).push({ depth: depthAt(rect, z0 + h / 2), svg });
    }
  } else {
    const slots = slotsOf(hall, box);
    const placed = plan.own[state.hall] + plan.guests[state.hall].reduce((sum, entry) => sum + entry.count, 0);
    slots.slice(0, placed).forEach((slot, index) => addBox(boxRect(hall, box, slot), slot.side, BAND[0] + slot.row * box.h, box.h, box.w, index >= plan.own[state.hall]));
  }

  const byDepth = (list) => list.sort((a, b) => a.depth - b.depth).map((item) => item.svg).join("");
  scene.innerHTML = out.join("") + byDepth(farBodies) + byDepth(farThings) + byDepth(nearThings) + byDepth(nearBoxes);
}

function say() {
  const plan = ALLOC[state.proto];
  const id = state.hall;
  const guests = plan.guests[id];
  const guestCount = guests.reduce((sum, entry) => sum + entry.count, 0);
  const placed = plan.own[id] + guestCount;
  const blocs = plan.box.blocs ? Object.keys(BLOCS).map((type) => [type, plan.blocs[id].filter((bloc) => bloc.type === type).length]).filter(([, n]) => n).map(([type, n]) => `${n} × ${type}`).join(" + ") : "";
  const spare = plan.box.blocs ? plan.blocs[id].reduce((sum, bloc) => sum + blocGeometry(bloc).boxes - bloc.used, 0) : 0;
  const text = `${HALLS[id].name} · ${plan.box.label}${plan.box.blocs ? "" : ` ${plan.box.h}×${plan.box.w}×${plan.box.d} cm`} · ` + (plan.box.blocs ? `${blocs} · ${placed} boxes (${plan.box.h} cm each), ${spare} spare${plan.unplaced[id] ? `, ${plan.unplaced[id]} missing` : ""}` : `${placed} of ${plan.capacity[id]} slots`) + (guestCount ? ` · incl. ${guests.map((g) => `${g.count} from ${g.from}`).join(", ")}` : "");
  if (readout.textContent !== text) readout.textContent = text;
}

// The workflow publishes pictures-simulation/ next to index.html; opened from mockup/ it sits one level up.
function showPhoto() {
  const file = PROTOTYPES[state.proto].photos?.[state.hall];
  const link = document.querySelector(".mk-photo");
  link.hidden = !file;
  if (file) link.innerHTML = `Simulation on photo: <a href="${(location.pathname.includes("/mockup/") ? "../" : "") + "pictures-simulation/" + encodeURIComponent(file)}" target="_blank" rel="noopener">${file}</a>`;
}

function buildTable() {
  const plan = ALLOC[state.proto];
  const rows = Object.keys(HALLS).map((id) => {
    const slots = plan.box.blocs ? [] : slotsOf(HALLS[id], plan.box);
    const guestsIn = plan.guests[id];
    const guestCount = guestsIn.reduce((sum, entry) => sum + entry.count, 0);
    const sent = Object.entries(plan.guests).flatMap(([host, list]) => list.filter((entry) => entry.from === id).map((entry) => `${entry.count} → ${host}`));
    const used = {};
    slots.slice(0, plan.own[id] + guestCount).forEach((slot) => { used[slot.side] = (used[slot.side] || 0) + 1; });
    const walls = plan.box.blocs
      ? "SENW".split("").map((side) => [side, plan.blocs[id].filter((bloc) => bloc.side === side)]).filter(([, list]) => list.length).map(([side, list]) => `${SIDE_NAME[side]} ${Object.keys(BLOCS).map((type) => [type, list.filter((bloc) => bloc.type === type).length]).filter(([, n]) => n).map(([type, n]) => `${n}×${type}`).join("+")}`).join(", ")
      : Object.entries(used).map(([side, count]) => `${SIDE_NAME[side]} ${count}`).join(", ");
    return `<tr data-hall="${id}"${id === state.hall ? ' aria-selected="true"' : ""}><th scope="row">${HALLS[id].name}</th><td>${DEMAND[id]}</td><td>${plan.capacity[id]}</td><td>${plan.own[id]}</td><td>${guestsIn.map((g) => `${g.count} from ${g.from}`).join(", ") || "–"}</td><td>${sent.join(", ") || "–"}</td><td>${walls}</td></tr>`;
  });
  const total = Object.keys(HALLS).reduce((sum, id) => sum + plan.own[id] + plan.guests[id].reduce((s, g) => s + g.count, 0), 0);
  tableBox.innerHTML = `<table><thead><tr><th>Hall</th><th>Needs</th><th>Slots</th><th>Own placed</th><th>Guests</th><th>Sent out</th><th>Boxes per wall</th></tr></thead><tbody>${rows.join("")}</tbody><tfoot><tr><th>Total</th><td>${Object.values(DEMAND).reduce((a, b) => a + b, 0)}</td><td>${Object.values(plan.capacity).reduce((a, b) => a + b, 0)}</td><td colspan="4">${total} placed · ${Object.values(plan.unplaced).reduce((a, b) => a + b, 0)} not placed</td></tr></tfoot></table>`;
  if (plan.columns) {
    const note = Object.entries(plan.columns).map(([column, { needs, boxes }]) => `${column} ${boxes} for ${needs}${boxes < needs ? ` (${needs - boxes} missing)` : boxes > needs ? ` (${boxes - needs} spare)` : ""}`).join(" · ");
    tableBox.insertAdjacentHTML("beforeend", `<p class="mk-columns">Per column, boxes hung for boxes needed: ${note}</p>`);
  }
  tableBox.querySelectorAll("tr[data-hall]").forEach((row) => row.addEventListener("click", () => choose({ hall: row.dataset.hall })));
}

function syncButtons() {
  document.querySelectorAll("[data-hall-btn]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.hallBtn === state.hall)));
  document.querySelectorAll("[data-proto-btn]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.protoBtn === state.proto)));
}

function choose(next) {
  Object.assign(state, next);
  syncButtons();
  showPhoto();
  buildTable();
  dirty = true;
  run();
}

let dirty = true, frame = 0, last = 0, clock = 0, visible = false, idleUntil = 0;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  clock += dt;
  if (!still.matches && now > idleUntil) state.azTarget = state.base + 12 * Math.sin(clock / 3.2);
  const before = state.az;
  state.az = still.matches ? state.azTarget : state.az + (state.azTarget - state.az) * (1 - Math.exp(-dt / 0.18));
  if (Math.abs(state.az - before) > 0.005 || dirty) { render(); say(); dirty = false; }
  frame = visible ? requestAnimationFrame(tick) : 0;
}
function run() { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } }
const steer = (azimuth) => { state.base = azimuth; state.azTarget = azimuth; idleUntil = performance.now() + 3600; run(); };

document.querySelectorAll("[data-hall-btn]").forEach((button) => button.addEventListener("click", () => choose({ hall: button.dataset.hallBtn })));
document.querySelectorAll("[data-proto-btn]").forEach((button) => button.addEventListener("click", () => choose({ proto: button.dataset.protoBtn })));
document.querySelector("[data-turn]").addEventListener("click", () => steer(state.base + 90));

let drag = null;
stage.addEventListener("pointerdown", (event) => { drag = { x: event.clientX, base: state.base }; stage.setPointerCapture(event.pointerId); });
stage.addEventListener("pointermove", (event) => { if (drag) steer(drag.base + (event.clientX - drag.x) * 0.4); });
stage.addEventListener("pointerup", () => { drag = null; });
stage.addEventListener("keydown", (event) => {
  const step = event.key === "ArrowLeft" ? -15 : event.key === "ArrowRight" ? 15 : 0;
  if (!step) return;
  event.preventDefault();
  steer(state.base + step);
});
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) idleUntil = Infinity;
syncButtons();
showPhoto();
buildTable();
render();
say();
