import {Composition} from 'remotion';
import './fonts';
import {DURATION, FPS, H, W} from './timeline';
import {Video} from './Video';

export const Root: React.FC = () => (
  <>
    <Composition
      id="DaaraTanneef"
      component={Video}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{withMusic: true}}
    />
    <Composition
      id="DaaraTanneefSansMusique"
      component={Video}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{withMusic: false}}
    />
  </>
);
