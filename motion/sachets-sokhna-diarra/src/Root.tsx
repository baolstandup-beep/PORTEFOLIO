import {Composition} from 'remotion';
import {SachetsVideo, DURATION, FPS} from './SachetsVideo';

export const Root: React.FC = () => (
  <Composition
    id="SachetsSokhnaDiarra"
    component={SachetsVideo}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
