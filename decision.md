# Mailbox placement: decisions per prototype

189 boxes to place (7 columns A–G × 3 apartments × 9 floors = 27 each). Halls: AB serves A+B (54), C, D, E, F and G serve one column each (27).

## Rules applied

- Wall-mounted only, in the 0.90–1.50 m band (0.60 m tall). Rows per wall: standard 2 (52 cm), semi-vertical 2 (60 cm), semi-horizontal 5 (55 cm).
- A box goes on bare wall only. Excluded: doors, glass doors, loge window, radiators, planters (bacs), mirrors, interphones/digicode, EDF/gas cabinets, lift, stairs. The radiator marked "à supprimer" in hall E is treated as free wall.
- 10 cm kept free at each end of a wall run.
- Whole columns of boxes are filled one after another, longest wall run first. Boxes of the hall's own columns first; extras of a full hall go to the nearest hall that still has room (distance measured on the global plan). Nearest order: E → F, then G; G → F, then C, then E.
- Positions below: wall side is the sheet orientation (top of the plan = N), measured in cm from the north-west corner (N/S walls from the west end, E/W walls from the north end).

## Summary

| Prototype | Fits in own halls | Moved to a second hall | Total placed |
|---|---|---|---|
| standard 26×26×34 | 173 | 16 (E→F 7, G→F 6, G→C 3) | 189 |
| semi-vertical 30×29×15.7 | 169 | 20 (E→F 9, G→C 11) | 189 |
| semi-horizontal 11×37×27.5 | 189 | 0 | 189 |

Hall capacity (boxes):

| Hall | needs | standard | semi-vertical | semi-horizontal |
|---|---|---|---|---|
| AB | 54 | 130 | 122 | 225 |
| C | 27 | 60 | 52 | 95 |
| D | 27 | 40 | 36 | 65 |
| E | 27 | **20** | **18** | 35 |
| F | 27 | 40 | 36 | 65 |
| G | 27 | **18** | **16** | 35 |

E and G are the constraint: short free walls (about 4 m each) and a radiator, interphone and planter on the rest.

## 1. Standard (26 h × 26 w × 34 d)

| Hall | Placed | Where |
|---|---|---|
| AB | 54 | east wall 10–300 (22), west wall 120–390 (20), west wall 590–850 (12). 76 slots unused |
| C | 27 + 3 from G = 30 | east wall 180–540 (26), north wall 210–340 (4, of which G's 3) |
| D | 27 | west wall 10–200 (14), east wall 170–310 (10), west wall 342–460 (3) |
| E | 20 (full), 7 sent to F | west wall 10–180 (12), east wall 265–360 (6), east wall 10–50 (2) |
| F | 27 + 13 guests (7 E, 6 G) = 40 (full) | south wall 310–480 (12), west wall 235–365 (10), north wall 285–405 (8), east wall 10–85 (4), west wall 795–855 (4), north wall 10–40 (2) |
| G | 18 (full), 6 sent to F, 3 to C | east wall 230–350 (8), west wall 10–95 (6), south wall 200–275 (4) |

## 2. Semi-vertical (30 h × 29 w × 15.7 d)

| Hall | Placed | Where |
|---|---|---|
| AB | 54 | east wall 10–300 (20), west wall 120–390 (18), west wall 590–850 (16). 68 slots unused |
| C | 27 + 11 from G = 38 | east wall 180–540 (24), north wall 210–340 (8), west wall 10–95 (4), west wall 460–540 (2) |
| D | 27 | west wall 10–200 (12), east wall 170–310 (8), west wall 342–460 (7) |
| E | 18 (full), 9 sent to F | west wall 10–180 (10), east wall 265–360 (6), east wall 10–50 (2) |
| F | 27 + 9 from E = 36 (full) | south wall 310–480 (10), west wall 235–365 (8), north wall 285–405 (8), east wall 10–85 (4), west wall 795–855 (4), north wall 10–40 (2) |
| G | 16 (full), 11 sent to C | east wall 230–350 (8), west wall 10–95 (4), south wall 200–275 (4) |

Slimmest box (15.7 cm deep) but the tallest and widest, so it has the least capacity of the three after the standard one in the small halls.

## 3. Semi-horizontal (11 h × 37 w × 27.5 d)

| Hall | Placed | Where |
|---|---|---|
| AB | 54 | east wall 10–300 (35), west wall 120–390 (19). 171 slots unused |
| C | 27 | east wall 180–540 (27 of 45) |
| D | 27 | west wall 10–200 (25), east wall 170–310 (2) |
| E | 27 | west wall 10–180 (20), east wall 265–360 (7) |
| F | 27 | south wall 310–480 (20), west wall 235–365 (7) |
| G | 27 | east wall 230–350 (15), west wall 10–95 (10), south wall 200–275 (2) |

Five rows fit the 60 cm band, so every hall keeps its own columns and no box leaves its hall.

## Concerns

- **Plan readings are estimates.** The plans are hand sketches and several dimensions are illegible. Wall segments live in `mockup/halls.mjs`; correcting a length there recomputes everything. E, G and F are the most sensitive (a 30 cm error changes a column).
- **Standard and semi-vertical overflow into hall F**, which already has few free walls (about 5 m). Only the semi-horizontal prototype avoids shared halls.
- **Depth into the hall:** standard protrudes 34 cm, semi-horizontal 27.5 cm, semi-vertical 15.7 cm. Hall E and G are 2.85 m wide with a door swing on one side, so check egress width and accessibility (PMR) rules before choosing standard.
- **AB is hardly used** (54 of 122–225). It is too far from E and G to take their overflow under the "nearest hall" rule.
- **Column grouping:** boxes are not yet grouped per column/floor inside a hall; only counts and walls are decided.
- The 3D page is not built yet.
