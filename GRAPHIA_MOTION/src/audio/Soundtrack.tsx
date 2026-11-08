import React from 'react';
import { Audio, staticFile } from 'remotion';
import { CutName } from '../utils/timeline';

/** Bande-son pré-mixée (voix + musique + SFX) générée par scripts/build_audio.py. */
export const Soundtrack: React.FC<{ cut: CutName }> = ({ cut }) => <Audio src={staticFile(`audio/mix_${cut}.wav`)} />;
