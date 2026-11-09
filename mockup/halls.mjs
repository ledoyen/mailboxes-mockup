// Hall data read from the hand-drawn plans (plans/*.png) and photos. Units: cm.
// Each wall lists segments in order: N and S run west→east, W and E run north→south.
// Only "wall" segments can carry mailboxes. Readings of illegible dimensions are estimates: edit here.

export const PROTOTYPES = {
  standard: { label: "standard", h: 26, w: 26, d: 34 },
  vertical: { label: "semi-vertical", h: 30, w: 29, d: 15.7 },
  horizontal: { label: "semi-horizontal", h: 11, w: 37, d: 27.5 },
  collective: { label: "B20 + C30", blocs: true, types: ["B20", "C30"], h: 14.5, d: 25 },
  // Fixed choice per column, whatever the demand.
  benoit: { label: "Benoit", blocs: true, types: ["B16", "B20", "C30"], h: 14.5, d: 25, walls: { C: "E", E: "W" }, columns: { A: ["C30"], B: ["C30"], C: ["B20", "B20"], D: ["C30"], E: ["B16", "B16"], F: ["B20", "B20"], G: ["C30"] } },
};

// Collective blocs: one wall-mounted cabinet holding cols × rows boxes, hung with its top at BLOC_TOP.
export const BLOCS = {
  B16: { boxes: 16, cols: 2, rows: 8, w: 70.5, h: 116, d: 25 },
  B20: { boxes: 20, cols: 2, rows: 10, w: 70.5, h: 145, d: 25 },
  C30: { boxes: 30, cols: 3, rows: 10, w: 101, h: 145, d: 25 },
};
export const BLOC_TOP = 150;

export const sizeOf = (box) => (box.blocs
  ? Object.entries(BLOCS).filter(([name]) => box.types.includes(name)).map(([name, bloc]) => `${name} ${bloc.boxes} boxes (${bloc.cols} × ${bloc.rows}, ${bloc.w} w × ${bloc.h} h × ${bloc.d} d cm)`).join(", ") + `, ${box.h} cm high each`
  : `${box.h} h × ${box.w} w × ${box.d} d cm`);

export const BAND = [90, 150]; // reachable height band, cm above the floor
export const END_MARGIN = 10; // cm kept free at each end of a wall run
export const RADIATOR_GAP = 30; // cm kept between a radiator and a bloc (any wall)
export const RADIATOR_DEPTH = 12;
export const CORNER_GAP = 30; // cm kept between boxes of two different walls, so every box front stays reachable

export const HALLS = {
  AB: {
    name: "Hall A–B",
    w: 690, d: 960, at: [475, 155],
    walls: {
      N: [["wall", 225], ["glass", 240], ["wall", 225]],
      E: [["wall", 310], ["interphone", 30], ["door", 150], ["wall", 80], ["loge", 250], ["wall", 140]],
      S: [["wall", 225], ["glass", 240], ["wall", 225]],
      W: [["radiator", 110], ["wall", 290], ["interphone", 30], ["door", 150], ["wall", 280], ["radiator", 100]],
    },
  },
  C: {
    name: "Hall C",
    w: 350, d: 550, at: [185, 170],
    walls: {
      N: [["wall", 40], ["door", 160], ["wall", 150]],
      E: [["wall", 30], ["cabinet", 140], ["wall", 380]],
      S: [["wall", 85], ["glass", 180], ["wall", 85]],
      W: [["wall", 105], ["door", 100], ["wall", 80], ["planter", 165], ["wall", 100]],
    },
  },
  D: {
    name: "Hall D (sas 1)",
    w: 330, d: 470, at: [470, 330],
    walls: {
      N: [["wall", 40], ["glass", 290]],
      E: [["wall", 35], ["planter", 125], ["wall", 160], ["interphone", 35], ["wall", 115]],
      S: [["wall", 40], ["door", 235], ["wall", 55]],
      W: [["wall", 210], ["mirror", 122], ["wall", 138]],
    },
  },
  E: {
    name: "Hall E (sas 3)",
    w: 285, d: 370, at: [300, 338],
    walls: {
      N: [["glass", 285]],
      E: [["wall", 60], ["planter", 195], ["wall", 115]],
      S: [["door", 240], ["wall", 45]],
      W: [["wall", 190], ["interphone", 45], ["door", 135]],
    },
  },
  F: {
    name: "Hall F",
    w: 490, d: 940, at: [180, 308],
    walls: {
      N: [["wall", 50], ["loge", 225], ["wall", 140], ["door", 75]],
      E: [["wall", 95], ["cabinet", 230], ["wall", 40], ["lift", 280], ["wall", 20], ["door", 120], ["cabinet", 155]],
      S: [["radiator", 100], ["mirror", 200], ["wall", 190]],
      W: [["wall", 45], ["door", 180], ["wall", 150], ["stairs", 170], ["door", 240], ["wall", 80], ["radiator", 75]],
    },
  },
  G: {
    name: "Hall G (sas 5)",
    w: 285, d: 360, at: [90, 338],
    walls: {
      N: [["wall", 40], ["glass", 245]],
      E: [["radiator", 150], ["wall", 30], ["interphone", 40], ["wall", 140]],
      S: [["wall", 15], ["door", 175], ["wall", 95]],
      W: [["wall", 105], ["planter", 190], ["wall", 35], ["interphone", 30]],
    },
  },
};

// Column → hall that serves it (global plan), and boxes needed per column.
export const COLUMNS = { A: "AB", B: "AB", C: "C", D: "D", E: "E", F: "F", G: "G" };
export const BOXES = { A: 31, B: 30, C: 40, D: 30, E: 33, F: 40, G: 30 };
export const DEMAND = Object.fromEntries(Object.keys(HALLS).map((id) => [id, Object.entries(COLUMNS).filter(([, hall]) => hall === id).reduce((sum, [column]) => sum + BOXES[column], 0)]));

for (const [id, hall] of Object.entries(HALLS)) {
  for (const side of "NESW") {
    const total = hall.walls[side].reduce((sum, [, length]) => sum + length, 0);
    const expected = side === "N" || side === "S" ? hall.w : hall.d;
    if (total !== expected) throw new Error(`${id} wall ${side} sums to ${total}, expected ${expected}`);
  }
}

export const rowsOf = (box) => Math.max(0, Math.floor((BAND[1] - BAND[0]) / box.h));

const byLongest = (a, b) => b.length - a.length;

// Free wall runs of a hall: { side, from, length } along the wall, margins applied.
export function freeRunsOf(hall) {
  const runs = [];
  for (const side of "NESW") {
    let at = 0;
    for (const [kind, length] of hall.walls[side]) {
      if (kind === "wall") runs.push({ side, from: at + END_MARGIN, length: Math.max(0, length - 2 * END_MARGIN) });
      at += length;
    }
  }
  return runs;
}

// Slots (one per box) of a hall for a prototype, filled column by column, longest runs first.
export function slotsOf(hall, box) {
  const rows = rowsOf(box);
  const span = [BAND[0], BAND[0] + rows * box.h];
  const slots = [], taken = [];
  for (const run of freeRunsOf(hall).sort((a, b) => b.length - a.length)) {
    const end = run.from + run.length;
    let cursor = run.from;
    for (;;) {
      const at = clearAt(hall, run.side, cursor, box, span, taken, RADIATOR_GAP);
      if (at + box.w > end) break;
      taken.push({ side: run.side, rect: wallStrip(hall, run.side, at, box.w, box.d), z0: span[0], z1: span[1] });
      for (let row = 0; row < rows; row++) slots.push({ side: run.side, at, row });
      cursor = at + box.w;
    }
  }
  return slots;
}

function wallStrip(hall, side, at, length, depth) {
  if (side === "N") return { x: at, y: 0, w: length, d: depth };
  if (side === "S") return { x: at, y: hall.d - depth, w: length, d: depth };
  if (side === "W") return { x: 0, y: at, w: depth, d: length };
  return { x: hall.w - depth, y: at, w: depth, d: length };
}

// What stands against the walls, with the depth and height range it occupies (same values as the 3D page draws).
const FIXTURES = {
  planter: [50, 0, 45], cabinet: [8, 0, 210], lift: [8, 0, 210], interphone: [6, 110, 146], loge: [14, 88, 205],
  mirror: [3, 20, 200], door: [5, 0, 210], glass: [4, 0, 210], stairs: [5, 0, 210], radiator: [RADIATOR_DEPTH, 12, 74],
};
const wallFixtureCache = new WeakMap();
function wallFixtures(hall) {
  if (wallFixtureCache.has(hall)) return wallFixtureCache.get(hall);
  const found = [];
  for (const side of "NESW") {
    let at = 0;
    for (const [kind, length] of hall.walls[side]) {
      if (FIXTURES[kind]) found.push({ kind, rect: wallStrip(hall, side, at, length, FIXTURES[kind][0]), z0: FIXTURES[kind][1], z1: FIXTURES[kind][2] });
      at += length;
    }
  }
  wallFixtureCache.set(hall, found);
  return found;
}

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.d && b.y < a.y + a.d;
const rectGap = (a, b) => Math.hypot(Math.max(0, a.x - (b.x + b.w), b.x - (a.x + a.w)), Math.max(0, a.y - (b.y + b.d), b.y - (a.y + a.d)));

// First position at or after `at` where a box or bloc (`size` w × d, between heights z0 and z1) collides with nothing:
// no fixture on any wall (corners included), no item already `taken` (CORNER_GAP away from items on another wall), and at least `radiatorGap` from every radiator.
function clearAt(hall, side, at, size, [z0, z1], taken, radiatorGap) {
  const blockers = [...wallFixtures(hall), ...taken.map((item) => ({ kind: "box", ...item }))];
  let position = at;
  for (;;) {
    const rect = wallStrip(hall, side, position, size.w, size.d);
    const blocked = blockers.some((item) => (item.kind === "radiator" ? rectGap(rect, item.rect) < radiatorGap : item.z0 < z1 && z0 < item.z1 && (item.side && item.side !== side ? rectGap(rect, item.rect) < CORNER_GAP || overlaps(rect, item.rect) : overlaps(rect, item.rect))));
    if (!blocked || position > at + 2000) return position;
    position += 1;
  }
}

const distance = (a, b) => Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]);

function nearestOf(ids) {
  return Object.fromEntries(ids.map((id) => [id, ids.filter((other) => other !== id).sort((a, b) => distance(HALLS[id], HALLS[a]) - distance(HALLS[id], HALLS[b]))]));
}

// Hangs blocs on the free runs, longest bloc first, each in the tightest run that still fits it.
function hang(runs, types) {
  const work = runs.map((run) => ({ ...run }));
  const taken = [...(work[0]?.taken ?? [])];
  const placed = [];
  for (const { type, i } of types.map((type, i) => ({ type, i })).sort((a, b) => BLOCS[b.type].w - BLOCS[a.type].w)) {
    const def = BLOCS[type], span = [BLOC_TOP - def.h, BLOC_TOP];
    const start = (run) => clearAt(HALLS[run.hall], run.side, run.at, def, span, taken, RADIATOR_GAP);
    const run = work.filter((candidate) => candidate.free >= def.w + start(candidate) - candidate.at).sort((a, b) => a.free - b.free)[0];
    if (!run) return null;
    const at = start(run);
    placed.push({ type, i, side: run.side, at });
    taken.push({ side: run.side, rect: wallStrip(HALLS[run.hall], run.side, at, def.w, def.d), z0: span[0], z1: span[1] });
    run.free -= at + def.w - run.at;
    run.at = at + def.w;
  }
  for (const run of work) run.taken = taken;
  return { placed, runs: work };
}

const before = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

// Mix of B20 and C30 that covers `demand` with the least wall; when no mix covers it, the one holding the most boxes.
function chooseBlocs(runs, demand) {
  let best = null;
  for (let c30 = 0; c30 <= 14; c30++) {
    for (let b20 = 0; b20 <= 14; b20++) {
      if (!c30 && !b20) continue;
      const hung = hang(runs, [...Array(c30).fill("C30"), ...Array(b20).fill("B20")]);
      if (!hung) continue;
      const boxes = 30 * c30 + 20 * b20, width = 101 * c30 + 70.5 * b20;
      const key = boxes >= demand ? [0, width, boxes] : [1, -boxes, width];
      if (!best || before(key, best.key)) best = { ...hung, boxes, key };
    }
  }
  return best;
}

// Blocs fixed per column: each hall hangs the blocs of its own columns; a column short of boxes stays short.
function allocateFixed(box) {
  const ids = Object.keys(HALLS);
  const blocs = {}, own = {}, unplaced = {}, capacity = {}, columns = {};
  for (const id of ids) {
    const mine = Object.entries(COLUMNS).filter(([, hall]) => hall === id).flatMap(([column]) => box.columns[column].map((type) => ({ type, column })));
    const runs = freeRunsOf(HALLS[id]).filter((run) => !box.walls?.[id] || run.side === box.walls[id]).sort(byLongest).map((run) => ({ hall: id, taken: [], side: run.side, at: run.from, free: run.length }));
    const hung = hang(runs, mine.map((item) => item.type));
    if (!hung) throw new Error(`${box.label}: blocs of hall ${id} do not fit its free walls`);
    const need = { ...BOXES };
    blocs[id] = [];
    for (const bloc of [...hung.placed].sort((a, b) => a.i - b.i)) {
      const column = mine[bloc.i].column;
      const used = Math.min(BLOCS[bloc.type].boxes, need[column]);
      need[column] -= used;
      blocs[id].push({ ...bloc, from: id, column, used });
      columns[column] = { needs: BOXES[column], boxes: (columns[column]?.boxes ?? 0) + BLOCS[bloc.type].boxes };
    }
    capacity[id] = blocs[id].reduce((sum, bloc) => sum + BLOCS[bloc.type].boxes, 0);
    own[id] = blocs[id].reduce((sum, bloc) => sum + bloc.used, 0);
    unplaced[id] = DEMAND[id] - own[id];
  }
  return { box, capacity, own, guests: Object.fromEntries(ids.map((id) => [id, []])), unplaced, nearest: nearestOf(ids), blocs, columns };
}

function allocateBlocs(box) {
  if (box.columns) return allocateFixed(box);
  const ids = Object.keys(HALLS);
  const nearest = nearestOf(ids);
  const runs = Object.fromEntries(ids.map((id) => [id, freeRunsOf(HALLS[id]).sort(byLongest).map((run) => ({ hall: id, taken: [], side: run.side, at: run.from, free: run.length }))]));
  const capacity = Object.fromEntries(ids.map((id) => [id, chooseBlocs(runs[id], Infinity)?.boxes ?? 0]));
  const blocs = Object.fromEntries(ids.map((id) => [id, []]));
  const guests = Object.fromEntries(ids.map((id) => [id, []]));
  const own = {}, unplaced = {};
  const hangFor = (host, from, demand) => {
    const choice = demand > 0 && chooseBlocs(runs[host], demand);
    if (!choice) return 0;
    runs[host] = choice.runs;
    let left = demand;
    for (const bloc of choice.placed) {
      const used = Math.min(BLOCS[bloc.type].boxes, left);
      left -= used;
      blocs[host].push({ ...bloc, from, used });
    }
    return demand - left;
  };
  for (const id of ids) own[id] = hangFor(id, id, DEMAND[id]);
  for (const id of ids) {
    let extra = DEMAND[id] - own[id];
    for (const other of nearest[id]) {
      const taken = hangFor(other, id, extra);
      if (taken > 0) guests[other].push({ from: id, count: taken });
      extra -= taken;
    }
    unplaced[id] = extra;
  }
  return { box, capacity, own, guests, unplaced, nearest, blocs };
}

// Own boxes first, then the extras of a full hall go to the nearest hall that still has room.
export function allocate(prototype) {
  const box = PROTOTYPES[prototype];
  if (box.blocs) return allocateBlocs(box);
  const ids = Object.keys(HALLS);
  const nearest = nearestOf(ids);
  const capacity = Object.fromEntries(ids.map((id) => [id, slotsOf(HALLS[id], box).length]));
  const own = Object.fromEntries(ids.map((id) => [id, Math.min(DEMAND[id], capacity[id])]));
  const guests = Object.fromEntries(ids.map((id) => [id, []]));
  const free = Object.fromEntries(ids.map((id) => [id, capacity[id] - own[id]]));
  const unplaced = {};
  for (const id of ids) {
    let extra = DEMAND[id] - own[id];
    for (const other of nearest[id]) {
      const taken = Math.min(extra, free[other]);
      if (taken > 0) guests[other].push({ from: id, count: taken });
      free[other] -= taken;
      extra -= taken;
    }
    unplaced[id] = extra;
  }
  return { box, capacity, own, guests, unplaced, nearest };
}
