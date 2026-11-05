import { Composition } from "remotion";
import { PorokhaneAd } from "./PorokhaneAd";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="PorokhaneAd"
    component={PorokhaneAd}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
