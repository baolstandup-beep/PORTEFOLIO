"""Zooms dynamiques : légère poussée continue + "punch-in" sur les mots clés.

Le zoom est exprimé comme une fonction FFmpeg z(t) (1.0 = pas de zoom), évaluée
image par image. Les punch-ins ont une attaque courte et un relâchement doux
pour rester naturels ; ils sont espacés d'au moins MIN_GAP secondes.
"""
from __future__ import annotations

PUSH = 0.05        # zoom progressif total sur la durée du clip (+5 %)
PUNCH = 0.08       # amplitude d'un punch-in (+8 %)
ATTACK, HOLD, RELEASE = 0.12, 0.55, 0.40
MIN_GAP = 5.0      # secondes minimales entre deux punch-ins


def pick_punch_times(keyword_times: list[float], duration: float) -> list[float]:
    """Choisit les instants de punch-in parmi les mots clés, espacés et en nombre limité."""
    picked: list[float] = []
    max_count = max(1, int(duration // 8))
    for t in sorted(keyword_times):
        if t < 1.5 or t > duration - 1.5:
            continue
        if picked and t - picked[-1] < MIN_GAP:
            continue
        picked.append(round(t, 3))
        if len(picked) >= max_count:
            break
    return picked


def zoom_expression(duration: float, punch_times: list[float], enabled: bool = True) -> str:
    if not enabled:
        return "1"
    terms = [f"1+{PUSH}*t/{max(duration, 1):.3f}"]
    for a in punch_times:
        end = a + ATTACK + HOLD + RELEASE
        terms.append(
            f"{PUNCH}*clip((t-{a:.3f})/{ATTACK},0,1)*clip(({end:.3f}-t)/{RELEASE},0,1)"
        )
    return "+".join(terms)
