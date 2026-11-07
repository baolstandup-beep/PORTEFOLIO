import { ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_TOTAL_BYTES } from './constants';

/** Détecte le vrai type d'un fichier à partir de ses premiers octets (on ne fait pas confiance à l'extension). */
export function sniffMime(buf: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' | null {
  const b = buf;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return 'image/png';
  if (b.length >= 12 && String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'image/webp';
  if (b.length >= 5 && String.fromCharCode(...b.slice(0, 5)) === '%PDF-') return 'application/pdf';
  return null;
}

export function safeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const cleaned = base
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^[-.]+|-+$/g, '')
    .slice(0, 80);
  return cleaned || 'fichier';
}

export function checkFileList(files: { size: number }[]): string | null {
  if (files.length > ATTACHMENT_MAX_FILES) return `${ATTACHMENT_MAX_FILES} fichiers maximum.`;
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > ATTACHMENT_MAX_TOTAL_BYTES) return 'Les fichiers dépassent 4 Mo au total. Réduisez leur taille ou envoyez plutôt un lien vers votre portfolio.';
  return null;
}
