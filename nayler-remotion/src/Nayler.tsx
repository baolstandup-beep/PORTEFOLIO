import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BasePlate, Ribbons } from "./components/Background";
import { FLYER_SRC } from "./components/FlyerCrop";
import { FLYER_H, FLYER_W } from "./regions";
import * as S from "./Scenes";
import { T } from "./timeline";

/** Une couche qui apparaît à `from` et reste jusqu'à la fin. */
const At: React.FC<{ from: number; children: React.ReactNode; name?: string }> = ({ from, children, name }) => (
  <Sequence from={from} layout="none" name={name}>
    {children}
  </Sequence>
);

export const Nayler: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Le flyer n'est JAMAIS redimensionné : il est posé à l'échelle 1 et centré.
  const offsetX = (width - FLYER_W) / 2;
  const offsetY = (height - FLYER_H) / 2;

  // Caméra : petite secousse contrôlée à l'impact du titre + zoom final lent.
  const k = frame - T.title;
  const shake = k >= 0 && k < 16 ? Math.exp(-k / 4) : 0;
  const shakeX = Math.sin(k * 2.7) * 4 * shake;
  const shakeY = Math.cos(k * 3.1) * 3 * shake;
  const zoom = interpolate(frame, [T.zoomStart, T.outro + 16], [1, 1.03], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });

  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      {/* Bandes hautes/basses (format 960×1600) : prolongement flouté du flyer */}
      {offsetY > 0 && (
        <AbsoluteFill>
          <Img
            src={FLYER_SRC}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(36px) saturate(1.15)",
              transform: `scale(${1.15 * zoom})`,
            }}
          />
          <AbsoluteFill style={{ background: "rgba(255,255,255,0.35)" }} />
        </AbsoluteFill>
      )}

      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: FLYER_W,
          height: FLYER_H,
          overflow: offsetY > 0 ? "visible" : "hidden",
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${zoom})`,
          transformOrigin: "50% 50%",
          boxShadow: offsetY > 0 ? "0 0 60px rgba(0,0,0,0.12)" : undefined,
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <BasePlate />

          {/* SCÈNE 1 */}
          <At from={T.topLogo} name="Logo IYAT TV"><S.TopLogo /></At>

          {/* SCÈNE 2 — ordre de profondeur : logo PAS-PAS derrière les portraits */}
          <At from={T.pasLogo} name="Logo PAS-PAS"><S.PasLogo /></At>
          <At from={T.leftPortrait} name="Matar Diakhaté"><S.LeftPortrait /></At>
          <At from={T.rightPortrait} name="Bassirou Sene"><S.RightPortrait /></At>
          <At from={T.leftBadge} name="Badge gauche"><S.LeftBadge /></At>
          <At from={T.rightBadge} name="Badge droit"><S.RightBadge /></At>

          {/* SCÈNE 3 */}
          <At from={T.title} name="Halo titre"><S.TitleGlow /></At>
          <At from={T.title} name="Titre NAYLER"><S.Title /></At>
          <At from={T.mic} name="Micro"><S.Mic /></At>

          {/* SCÈNE 4 */}
          <At from={T.banner} name="Bandeau"><S.BannerPlate /></At>
          <At from={T.calendar} name="Calendrier"><S.Calendar /></At>
          <At from={T.mardi} name="MARDI"><S.Mardi /></At>
          <At from={T.aPartirDe} name="À PARTIR DE"><S.APartirDe /></At>
          <At from={T.clock} name="Horloge"><S.Clock /></At>
          <At from={T.hour} name="20H00"><S.Hour /></At>

          {/* SCÈNE 5 */}
          <At from={T.bottomLogo} name="Logo bas"><S.BottomLogo /></At>
          <At from={T.master} name="Flyer original"><S.MasterFlyer /></At>
          <At from={T.halo} name="Halo logo"><S.LogoHalo /></At>
          <At from={T.finalSweep} name="Reflet final"><S.FinalSweep /></At>

          {/* Intro : rubans géométriques par-dessus tout */}
          <Sequence from={T.ribbons} durationInFrames={50} layout="none" name="Rubans">
            <Ribbons />
          </Sequence>
        </div>
      </div>

      <At from={T.outro} name="Transition finale"><S.Outro /></At>

      {withAudio && <Audio src={staticFile("audio/soundtrack.wav")} volume={0.9} />}
    </AbsoluteFill>
  );
};
