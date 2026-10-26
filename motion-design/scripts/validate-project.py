"""Contrôles automatiques du projet avant rendu.

- ressources présentes (PNG des éléments, audio référencé) ;
- timeline cohérente (plans contigus, apparitions dans leur plan, voix off sans
  chevauchement et contenue dans son plan, effets sonores dans la durée) ;
- plan final : chaque élément dans le cadre, informations hors zones d'interface ;
- écrit src/config/voiceover.timing.json (utilisé par prepare-audio.py pour
  assembler la piste voix off complète).

Usage : python3 scripts/validate-project.py   (code de sortie 1 si erreur bloquante)
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SAFE = {"top": 180, "bottom": 300, "side": 80}
# Éléments en bord perdu dans le PSD : ils touchent le bord par conception.
BLEED = {"colonne-motifs", "bandeau-contacts", "pupitre"}

errors, warnings = [], []


def main():
    tl = json.loads(subprocess.run(["npx", "tsx", "scripts/dump-timeline.ts"], cwd=ROOT,
                                   capture_output=True, text=True, check=True).stdout)
    meta = json.loads((ROOT / "src" / "config" / "assets.generated.json").read_text())
    total, fps = tl["totalFrames"], tl["video"]["fps"]
    W, H = tl["video"]["width"], tl["video"]["height"]

    # Ressources
    for e in meta["elements"]:
        if not (PUBLIC / e["src"]).exists():
            errors.append(f"image manquante : {e['src']}")
    for cue in tl["voice"]:
        if not (PUBLIC / cue["src"]).exists():
            errors.append(f"voix off manquante : {cue['src']} (lancer npm run audio)")
    for s in tl["sfx"]:
        if not (PUBLIC / s["src"]).exists():
            errors.append(f"effet sonore manquant : {s['src']}")

    # Plans contigus
    t = 0
    for sid, s in tl["shots"].items():
        if s["from"] != t:
            errors.append(f"{sid} commence à {s['from']} au lieu de {t}")
        t = s["from"] + s["duration"]
    if t != total:
        errors.append(f"somme des plans {t} ≠ durée totale {total}")

    # Apparitions : tous les éléments, dans leur plan, terminées avant la fin.
    ids = {e["id"] for e in meta["elements"]}
    revealed = {r["id"] for r in tl["reveals"]}
    for missing in ids - revealed:
        errors.append(f"élément jamais affiché : {missing}")
    for r in tl["reveals"]:
        shot = tl["shots"][r["shot"]]
        if not (shot["from"] - 30 <= r["at"] < shot["from"] + shot["duration"]):
            warnings.append(f"{r['id']} apparaît hors de son plan {r['shot']} (image {r['at']})")
        if r["at"] + r["duration"] > total - 30:
            errors.append(f"{r['id']} finit d'apparaître moins d'une seconde avant la fin")

    # Voix off : ordre, pas de chevauchement, contenue dans son plan.
    prev_end = -1
    for cue in sorted(tl["voice"], key=lambda c: c["from"]):
        end = cue["from"] + cue["duration"]
        if cue["from"] < prev_end:
            errors.append(f"voix off {cue['id']} chevauche la réplique précédente ({cue['from']} < {prev_end})")
        shot = tl["shots"][cue["shot"]]
        if end > shot["from"] + shot["duration"]:
            warnings.append(f"voix off {cue['id']} déborde de {cue['shot']} de {end - shot['from'] - shot['duration']} images")
        if end > total:
            errors.append(f"voix off {cue['id']} dépasse la fin de la vidéo")
        prev_end = end
    last_voice = max(c["from"] + c["duration"] for c in tl["voice"])
    if total - last_voice < fps:
        warnings.append(f"moins d'une seconde de tenue après la dernière réplique ({total - last_voice} images)")

    for s in tl["sfx"]:
        if s["from"] < 0 or s["from"] >= total:
            errors.append(f"effet sonore hors durée : {s['note']} ({s['from']})")

    # Plan final : cadre et zones de sécurité.
    for eid, r in tl["finalRects"].items():
        l, tp, rgt, bot = r["left"], r["top"], r["left"] + r["width"], r["top"] + r["height"]
        if l < -1 or tp < -1 or rgt > W + 1 or bot > H + 1:
            errors.append(f"plan final : {eid} sort du cadre ({l:.0f},{tp:.0f})–({rgt:.0f},{bot:.0f})")
        if eid in BLEED:
            continue
        if tp < SAFE["top"] or bot > H - SAFE["bottom"]:
            warnings.append(f"plan final : {eid} dans une marge haute/basse d'interface")
        if l < SAFE["side"] or rgt > W - SAFE["side"]:
            warnings.append(f"plan final : {eid} à moins de {SAFE['side']} px d'un bord latéral "
                            f"(gauche {l:.0f}, droite {W - rgt:.0f})")

    timing = {"starts": {c["id"]: c["from"] for c in tl["voice"]}, "totalFrames": total}
    (ROOT / "src" / "config" / "voiceover.timing.json").write_text(json.dumps(timing, indent=2))

    print(f"durée : {total} images = {total / fps:.2f} s, {W}×{H} @ {fps} i/s")
    for sid, s in tl["shots"].items():
        print(f"  {sid} {s['from']:>4}–{s['from'] + s['duration']:<4} {s['title']}")
    print(f"voix off : {len(tl['voice'])} répliques, dernière fin à l'image {last_voice}")
    for w in warnings:
        print("AVERTISSEMENT :", w)
    for e in errors:
        print("ERREUR :", e)
    print("OK" if not errors else f"{len(errors)} erreur(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
