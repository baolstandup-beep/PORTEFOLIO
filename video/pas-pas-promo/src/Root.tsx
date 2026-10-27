import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import timeline from "./timeline.json";

export const Root: React.FC = () => (
  <>
    <Composition
      id="PasPasPromo"
      component={Promo}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={1920}
      height={1080}
    />
    <Composition
      id="PasPasPromoShorts"
      component={Promo}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={1080}
      height={1920}
    />
  </>
);
