/**
 * Normalise un numéro en chiffres au format international sans « + ».
 * Les numéros sénégalais à 9 chiffres (7X XXX XX XX ou 3X XXX XX XX) reçoivent l'indicatif 221.
 * Renvoie null si le numéro n'est pas plausible.
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    // déjà international
  } else if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.length === 9 && /^[37]/.test(digits)) {
    digits = `221${digits}`;
  }
  if (digits.startsWith('221')) {
    return /^221[37]\d{8}$/.test(digits) ? digits : null;
  }
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function formatPhone(normalized: string): string {
  const m = normalized.match(/^221(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+221 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${normalized}`;
}
