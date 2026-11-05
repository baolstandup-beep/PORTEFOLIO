import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const sec = (s: number) => Math.round(s * FPS);

// Découpage du scénario (en frames, 30 fps)
export const SCENES = {
  intro: { from: 0, duration: sec(3) },
  citron: { from: sec(3), duration: sec(4) },
  ginger: { from: sec(7), duration: sec(4) },
  bissap: { from: sec(11), duration: sec(4) },
  packshot: { from: sec(15), duration: sec(5) },
} as const;

export const TOTAL_FRAMES = sec(20);

// Polices embarquées en local (public/fonts) : le rendu ne dépend pas d'Internet.
export const DISPLAY = "Anton";
export const BODY = "Montserrat";
loadFont({ family: DISPLAY, url: staticFile("fonts/Anton-Regular.woff2"), weight: "400" });
loadFont({ family: BODY, url: staticFile("fonts/Montserrat-Variable.woff2"), weight: "100 900" });

export const ASSETS = {
  logo: staticFile("logo.png"),
  citron: staticFile("bottles/citron-ananas.png"),
  ginger: staticFile("bottles/bissap-blanc-ginger.png"),
  bissap: staticFile("bottles/bissap.png"),
  music: staticFile("audio/music.wav"),
  sfx: {
    riser: staticFile("audio/sfx/riser.wav"),
    impact: staticFile("audio/sfx/impact.wav"),
    whoosh: staticFile("audio/sfx/whoosh.wav"),
    splash: staticFile("audio/sfx/splash.wav"),
    shimmer: staticFile("audio/sfx/shimmer.wav"),
    final: staticFile("audio/sfx/final.wav"),
  },
};

// Ratios largeur/hauteur des détourages (px source)
export const BOTTLE_RATIO = {
  citron: 475 / 1823,
  ginger: 460 / 1729,
  bissap: 451 / 1690,
};

export const PALETTE = {
  citron: { light: "#FFE45C", mid: "#F5B400", deep: "#3A2400", glow: "rgba(255,214,64,0.75)" },
  ginger: { light: "#FFC98A", mid: "#D9822B", deep: "#2B1205", glow: "rgba(255,170,90,0.7)" },
  bissap: { light: "#FF4D7A", mid: "#A0103C", deep: "#1C0420", glow: "rgba(220,30,90,0.7)", violet: "#6B2BD9" },
  gold: "#F4C66A",
};
