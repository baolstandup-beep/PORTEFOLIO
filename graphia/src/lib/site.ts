/** Coordonnées publiques de l'organisation : affichées seulement si elles sont renseignées. */
export const site = {
  name: 'GRAPHIA',
  slogan: 'Créer – Innover – Transformer',
  organizer: 'Baol Up Graphic – Agence Digitale',
  location: 'Touba, Sénégal',
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  contactWhatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || '',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
};
