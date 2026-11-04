// Hall data read from the hand-drawn plans (plans/*.png) and photos. Units: cm.
// Each wall lists segments in order: N and S run west→east, W and E run north→south.
// Only "wall" segments can carry mailboxes. Readings of illegible dimensions are estimates: edit here.

export const PROTOTYPES = {
  standard: { label: "standard", h: 26, w: 26, d: 34 },
  vertical: { label: "semi-vertical", h: 30, w: 29, d: 15.7 },
  horizontal: { label: "semi-horizontal", h: 11, w: 37, d: 27.5 },
};

export const BAND = [90, 150]; // reachable height band, cm above the floor
export const END_MARGIN = 10; // cm kept free at each end of a wall run
export const PER_COLUMN = 3 * 9;

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

// Column → hall that serves it (global plan). Columns have 3 apartments × 9 floors.
export const COLUMNS = { A: "AB", B: "AB", C: "C", D: "D", E: "E", F: "F", G: "G" };
export const DEMAND = Object.fromEntries(Object.keys(HALLS).map((id) => [id, Object.entries(COLUMNS).filter(([, hall]) => hall === id).length * PER_COLUMN]));

for (const [id, hall] of Object.entries(HALLS)) {
  for (const side of "NESW") {
    const total = hall.walls[side].reduce((sum, [, length]) => sum + length, 0);
    const expected = side === "N" || side === "S" ? hall.w : hall.d;
    if (total !== expected) throw new Error(`${id} wall ${side} sums to ${total}, expected ${expected}`);
  }
}

export const rowsOf = (box) => Math.max(0, Math.floor((BAND[1] - BAND[0]) / box.h));

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
  const slots = [];
  for (const run of freeRunsOf(hall).sort((a, b) => b.length - a.length)) {
    const columns = Math.floor(run.length / box.w);
    for (let column = 0; column < columns; column++) {
      for (let row = 0; row < rows; row++) slots.push({ side: run.side, at: run.from + column * box.w, row });
    }
  }
  return slots;
}

const distance = (a, b) => Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1]);

// Own boxes first, then the extras of a full hall go to the nearest hall that still has room.
export function allocate(prototype) {
  const box = PROTOTYPES[prototype];
  const ids = Object.keys(HALLS);
  const capacity = Object.fromEntries(ids.map((id) => [id, slotsOf(HALLS[id], box).length]));
  const own = Object.fromEntries(ids.map((id) => [id, Math.min(DEMAND[id], capacity[id])]));
  const guests = Object.fromEntries(ids.map((id) => [id, []]));
  const free = Object.fromEntries(ids.map((id) => [id, capacity[id] - own[id]]));
  const unplaced = {};
  for (const id of ids) {
    let extra = DEMAND[id] - own[id];
    const near = ids.filter((other) => other !== id).sort((a, b) => distance(HALLS[id], HALLS[a]) - distance(HALLS[id], HALLS[b]));
    for (const other of near) {
      const taken = Math.min(extra, free[other]);
      if (taken > 0) guests[other].push({ from: id, count: taken });
      free[other] -= taken;
      extra -= taken;
    }
    unplaced[id] = extra;
  }
  return { box, capacity, own, guests, unplaced, nearest: Object.fromEntries(ids.map((id) => [id, ids.filter((o) => o !== id).sort((a, b) => distance(HALLS[id], HALLS[a]) - distance(HALLS[id], HALLS[b]))])) };
}
