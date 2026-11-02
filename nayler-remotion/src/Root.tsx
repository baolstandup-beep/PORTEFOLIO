import React from "react";
import { Composition } from "remotion";
import { Nayler } from "./Nayler";
import { DURATION, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Format demandé : 960×1600 — le flyer (960×1280) est centré à l'échelle 1, sans recadrage */}
    <Composition id="Nayler" component={Nayler} durationInFrames={DURATION} fps={FPS} width={960} height={1600} defaultProps={{ withAudio: true }} />
    {/* Format natif du flyer : 960×1280 (3:4), plein cadre */}
    <Composition id="NaylerNative" component={Nayler} durationInFrames={DURATION} fps={FPS} width={960} height={1280} defaultProps={{ withAudio: true }} />
  </>
);
