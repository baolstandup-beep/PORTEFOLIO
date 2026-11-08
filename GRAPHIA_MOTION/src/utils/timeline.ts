import TL from '../timeline.json';

export type CutName = 'long' | 'short';
export const timeline = TL;
export const FPS = TL.fps;
export const cutOf = (name: CutName) => TL.cuts[name];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Cues = Record<string, any>;
