/**
 * ============================================================
 *  SET VOYAGE — FICHIER DE PERSONNALISATION UNIQUE
 * ============================================================
 *  Tout ce qui change d'une agence/version à l'autre est ici.
 *  Les fichiers médias se placent dans /public (chemins relatifs à /public).
 *  Aucune modification du code des scènes n'est nécessaire.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// ---------- Identité & contact (À REMPLACER : valeurs factices) ----------
export const AGENCE = {
  nom: 'SET VOYAGE',
  slogan: 'Le monde à portée de main',
  telephone: '+221 77 000 00 00', // ⚠ numéro factice
  whatsapp: '+221 77 000 00 00', // ⚠ numéro factice (mettre null pour masquer)
  adresse: 'Adresse de l’agence, Ville', // ⚠ adresse factice
  siteOuReseau: '@setvoyage', // ⚠ factice (mettre null pour masquer)
  villeDepart: 'Dakar', // ville d'origine des trajets animés
} as const;

export const RESPONSABLE = {
  nom: 'Nom du Responsable', // ⚠ à remplacer
  fonction: 'Fondateur & Directeur',
  citation: '« Votre voyage mérite un accompagnement sur mesure. »',
  /** Cadrage de la photo dans le cercle (CSS object-position) + zoom. */
  cadrage: '54% 28%',
  zoom: 1.9,
} as const;

// ---------- Médias remplaçables (chemins dans /public) ----------
export const MEDIAS = {
  /** Logo fourni (fond détouré). Ancien emblème provisoire : 'assets/logo.svg'. */
  logo: 'assets/logo-setcom.png',
  /** true = logo horizontal complet (avec texte) posé sur une plaque blanche. false = emblème carré + texte généré. */
  logoContientTexte: true,
  /** Largeur / hauteur du fichier logo (utilisé quand logoContientTexte = true). */
  logoRatio: 1286 / 338,
  /** Affiche « SET VOYAGE » en texte animé sous le logo (utile si le logo porte un autre nom). */
  afficherNomAgence: true,
  /** ⚠ Placeholder : photo de banque d'images. Remplacer par le vrai portrait. */
  portrait: 'assets/responsable.jpg',
  avion: 'assets/avion.svg', // PNG détouré, avion orienté vers la DROITE
  photos: {
    familleDepart: 'assets/photos/famille-depart.jpg',
    familleBillets: 'assets/photos/famille-billets.jpg',
    voyageurManteau: 'assets/photos/voyageur-manteau.jpg',
    voyageurTelephone: 'assets/photos/voyageur-telephone.jpg',
    voyageurAffaires: 'assets/photos/voyageur-affaires.jpg',
  },
} as const;

// ---------- Audio ----------
// Mettre `null` tant que le fichier n'existe pas (sinon le rendu échoue).
export const AUDIO = {
  musique: null as string | null, // ex : 'audio/musique.mp3'
  volumeMusique: 0.55,
  /** Volume de la musique quand la voix parle (ducking automatique). */
  volumeMusiqueSousVoix: 0.18,
  /** Si true : affiche le script de la voix off en sous-titres (attention : se superpose au bas de l’écran). */
  sousTitres: false,
};

// ---------- Timeline (en frames, 30 fps) ----------
// Durée totale = somme(scènes) − somme(transitions) = 1290 − 90 = 1200 f = 40 s
export const TRANSITION = 18;
export const SCENES = {
  intro: 165,
  responsable: 195,
  services: 240,
  destinations: 300,
  serviceClient: 195,
  final: 195,
} as const;

/** Début absolu de chaque scène dans la vidéo (tient compte des chevauchements). */
export const DEBUTS = (() => {
  const ordre = Object.keys(SCENES) as (keyof typeof SCENES)[];
  const out = {} as Record<keyof typeof SCENES, number>;
  let t = 0;
  for (const k of ordre) {
    out[k] = t;
    t += SCENES[k] - TRANSITION;
  }
  return out;
})();

export const DUREE_TOTALE =
  Object.values(SCENES).reduce((a, b) => a + b, 0) -
  TRANSITION * (Object.keys(SCENES).length - 1);

// ---------- Voix off : script + synchronisation ----------
// Chaque réplique démarre à `debut` (frames, absolu). Si `fichier` est renseigné,
// l'audio est calé exactement sur ce point ; sinon seuls les sous-titres s'affichent.
// Enregistrer une piste par réplique = synchronisation parfaite sans retouche.
// Voix actuelle : générée par synthèse vocale (ElevenLabs, voix « JOHN MALA »). `duree` = durée réelle du fichier.
export type Replique = {
  debut: number;
  duree: number;
  texte: string;
  fichier: string | null; // ex : 'audio/voix/01-intro.mp3'
};

export const VOIX_OFF: Replique[] = [
  {
    debut: DEBUTS.intro + 20,
    duree: 117,
    texte: 'Votre prochain voyage commence ici, avec SET VOYAGE.',
    fichier: 'audio/voix/01-intro.mp3',
  },
  {
    debut: DEBUTS.responsable + 15,
    duree: 136,
    texte: 'Notre équipe vous accompagne personnellement, à chaque étape de votre voyage.',
    fichier: 'audio/voix/02-responsable.mp3',
  },
  {
    debut: DEBUTS.services + 15,
    duree: 165,
    texte: 'Billets d’avion toutes compagnies, au meilleur prix. Réservation rapide, paiement sécurisé.',
    fichier: 'audio/voix/03-billets.mp3',
  },
  {
    debut: DEBUTS.destinations + 20,
    duree: 193,
    texte: 'Paris, Dubaï, Istanbul, New York… Le monde entier est à votre portée.',
    fichier: 'audio/voix/04-destinations.mp3',
  },
  {
    debut: DEBUTS.serviceClient + 15,
    duree: 138,
    texte: 'Un service client à l’écoute, avant, pendant et après votre voyage.',
    fichier: 'audio/voix/05-service-client.mp3',
  },
  {
    debut: DEBUTS.final + 20,
    duree: 88,
    texte: 'SET VOYAGE. Appelez-nous dès aujourd’hui !',
    fichier: 'audio/voix/06-final.mp3',
  },
];

// ---------- Contenus des scènes ----------
export const SERVICES = [
  { icone: 'avion', titre: 'Billets d’avion', detail: 'Toutes compagnies, tous continents' },
  { icone: 'prix', titre: 'Meilleurs tarifs', detail: 'Comparaison en temps réel' },
  { icone: 'eclair', titre: 'Réservation express', detail: 'Billet confirmé en quelques minutes' },
  { icone: 'cadenas', titre: 'Paiement sécurisé', detail: 'Espèces, mobile money, carte' },
] as const;

export const DESTINATIONS = [
  { ville: 'Paris', pays: 'France', photo: MEDIAS.photos.voyageurManteau, couleur: '#1E6FD9' },
  { ville: 'Dubaï', pays: 'Émirats arabes unis', photo: MEDIAS.photos.voyageurAffaires, couleur: '#F5B700' },
  { ville: 'Istanbul', pays: 'Turquie', photo: MEDIAS.photos.familleDepart, couleur: '#E63946' },
  { ville: 'New York', pays: 'États-Unis', photo: MEDIAS.photos.voyageurTelephone, couleur: '#1E6FD9' },
] as const;

export const AVANTAGES = [
  'Conseiller dédié joignable 7j/7',
  'Assistance visa & formalités',
  'Modification et annulation simplifiées',
  'Paiement en plusieurs fois',
] as const;
