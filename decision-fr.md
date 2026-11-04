# Placement des boîtes aux lettres : décisions par prototype

189 boîtes à placer (7 colonnes A–G × 3 appartements × 9 étages = 27 chacune). Halls : AB dessert A+B (54), C, D, E, F et G desservent chacun une colonne (27).

## Règles appliquées

- Fixation murale uniquement, dans la bande 0,90–1,50 m (0,60 m de haut). Rangées par mur : standard 2 (52 cm), semi-vertical 2 (60 cm), semi-horizontal 5 (55 cm).
- Une boîte se pose sur du mur nu uniquement. Exclus : portes, portes vitrées, fenêtre de la loge, radiateurs, bacs, miroirs, interphones/digicode, armoires EDF/gaz, ascenseur, escalier. Le radiateur « à supprimer » du hall E est traité comme du mur libre.
- 10 cm laissés libres à chaque extrémité d'un pan de mur.
- Les colonnes de boîtes sont remplies une à une, du pan de mur le plus long au plus court. Les boîtes des colonnes du hall d'abord ; le surplus d'un hall plein va dans le hall le plus proche qui a encore de la place (distance mesurée sur le plan global). Ordre de proximité : E → F, puis G ; G → F, puis C, puis E.
- Positions ci-dessous : le côté du mur suit l'orientation de la feuille (haut du plan = N), en cm depuis l'angle nord-ouest (murs N/S depuis l'ouest, murs E/O depuis le nord).

## Synthèse

| Prototype | Tient dans ses halls | Déplacé vers un second hall | Total placé |
|---|---|---|---|
| standard 26×26×34 | 173 | 16 (E→F 7, G→F 6, G→C 3) | 189 |
| semi-vertical 30×29×15,7 | 169 | 20 (E→F 9, G→C 11) | 189 |
| semi-horizontal 11×37×27,5 | 189 | 0 | 189 |

Capacité des halls (boîtes) :

| Hall | besoin | standard | semi-vertical | semi-horizontal |
|---|---|---|---|---|
| AB | 54 | 130 | 122 | 225 |
| C | 27 | 60 | 52 | 95 |
| D | 27 | 40 | 36 | 65 |
| E | 27 | **20** | **18** | 35 |
| F | 27 | 40 | 36 | 65 |
| G | 27 | **18** | **16** | 35 |

E et G sont la contrainte : peu de mur libre (environ 4 m chacun), le reste est pris par un radiateur, un interphone et un bac.

## 1. Standard (26 h × 26 l × 34 p)

| Hall | Placées | Où |
|---|---|---|
| AB | 54 | mur est 10–300 (22), mur ouest 120–390 (20), mur ouest 590–850 (12). 76 emplacements inutilisés |
| C | 27 + 3 de G = 30 | mur est 180–540 (26), mur nord 210–340 (4, dont les 3 de G) |
| D | 27 | mur ouest 10–200 (14), mur est 170–310 (10), mur ouest 342–460 (3) |
| E | 20 (plein), 7 envoyées vers F | mur ouest 10–180 (12), mur est 265–360 (6), mur est 10–50 (2) |
| F | 27 + 13 invitées (7 de E, 6 de G) = 40 (plein) | mur sud 310–480 (12), mur ouest 235–365 (10), mur nord 285–405 (8), mur est 10–85 (4), mur ouest 795–855 (4), mur nord 10–40 (2) |
| G | 18 (plein), 6 envoyées vers F, 3 vers C | mur est 230–350 (8), mur ouest 10–95 (6), mur sud 200–275 (4) |

## 2. Semi-vertical (30 h × 29 l × 15,7 p)

| Hall | Placées | Où |
|---|---|---|
| AB | 54 | mur est 10–300 (20), mur ouest 120–390 (18), mur ouest 590–850 (16). 68 emplacements inutilisés |
| C | 27 + 11 de G = 38 | mur est 180–540 (24), mur nord 210–340 (8), mur ouest 10–95 (4), mur ouest 460–540 (2) |
| D | 27 | mur ouest 10–200 (12), mur est 170–310 (8), mur ouest 342–460 (7) |
| E | 18 (plein), 9 envoyées vers F | mur ouest 10–180 (10), mur est 265–360 (6), mur est 10–50 (2) |
| F | 27 + 9 de E = 36 (plein) | mur sud 310–480 (10), mur ouest 235–365 (8), mur nord 285–405 (8), mur est 10–85 (4), mur ouest 795–855 (4), mur nord 10–40 (2) |
| G | 16 (plein), 11 envoyées vers C | mur est 230–350 (8), mur ouest 10–95 (4), mur sud 200–275 (4) |

La boîte la moins profonde (15,7 cm) mais la plus haute et la plus large : dans les petits halls, sa capacité est la plus faible des trois.

## 3. Semi-horizontal (11 h × 37 l × 27,5 p)

| Hall | Placées | Où |
|---|---|---|
| AB | 54 | mur est 10–300 (35), mur ouest 120–390 (19). 171 emplacements inutilisés |
| C | 27 | mur est 180–540 (27 sur 45) |
| D | 27 | mur ouest 10–200 (25), mur est 170–310 (2) |
| E | 27 | mur ouest 10–180 (20), mur est 265–360 (7) |
| F | 27 | mur sud 310–480 (20), mur ouest 235–365 (7) |
| G | 27 | mur est 230–350 (15), mur ouest 10–95 (10), mur sud 200–275 (2) |

Cinq rangées tiennent dans la bande de 60 cm : chaque hall garde ses propres colonnes et aucune boîte ne change de hall.

## Points d'attention

- **Les relevés sont des estimations.** Les plans sont des croquis à la main et plusieurs cotes sont illisibles. Les pans de mur sont dans `mockup/halls.mjs` ; corriger une longueur y recalcule tout. E, G et F sont les plus sensibles (30 cm d'erreur changent une colonne).
- **Standard et semi-vertical débordent vers le hall F**, qui a déjà peu de mur libre (environ 5 m). Seul le semi-horizontal évite de partager des halls.
- **Saillie dans le hall :** standard 34 cm, semi-horizontal 27,5 cm, semi-vertical 15,7 cm. Les halls E et G font 2,85 m de large avec un battant de porte d'un côté : vérifier la largeur de passage et les règles d'accessibilité (PMR) avant de retenir le standard.
- **AB est peu utilisé** (54 sur 122–225). Il est trop loin de E et G pour recevoir leur surplus avec la règle « hall le plus proche ».
- **Regroupement par colonne :** les boîtes ne sont pas encore regroupées par colonne/étage dans un hall ; seuls les nombres et les murs sont décidés.
- La page 3D n'est pas encore construite.
