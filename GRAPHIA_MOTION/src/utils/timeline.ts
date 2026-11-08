import TL from '../timeline.json';

export type CutName = 'long' | 'short' | 'full' | 'candidater' | 'partenaires';
export const timeline = TL;
export const FPS = TL.fps;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cutOf = (name: CutName) => (TL.cuts as Record<string, any>)[name] as { duration: number; voFile: string; scenes: { id: string; from: number; to: number }[]; cues: Record<string, Record<string, unknown>> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Cues = Record<string, any>;
