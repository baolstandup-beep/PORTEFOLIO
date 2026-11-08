import { Cues } from '../utils/timeline';

/** Contrat commun à toutes les scènes : chaque scène est indépendante et ne lit que ses propres repères. */
export type SceneProps = {
  /** durée de la scène (s) */
  dur: number;
  /** repères temporels locaux (s, depuis le début de la scène) — voir src/timeline.json */
  cues: Cues;
};
