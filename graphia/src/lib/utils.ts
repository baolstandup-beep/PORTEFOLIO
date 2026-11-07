import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (d: Date | string, withTime = true) =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    ...(withTime ? { timeStyle: 'short' } : {}),
    timeZone: 'Africa/Dakar',
  }).format(new Date(d));
