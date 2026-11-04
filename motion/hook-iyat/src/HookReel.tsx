import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { FontLoader } from './FontLoader';

/**
 * Tout le texte est piloté par les props : changer le titre ici
 * (ou dans Remotion Studio) suffit, pas besoin de toucher l'animation.
 */
export type HookReelProps = {
  /** Lignes du titre d'accroche, une entrée par ligne. */
  hookLines: string[];
  /** Mots du titre à surligner (comparaison insensible à la casse). */
  highlight: string[];
  /** Pastille sous la vidéo. */
  badge: string;
  /** Phrase de relance sous la pastille. */
  teaser: string;
  /** Appel à l'action des 2 dernières secondes. */
  cta: string;
};

export const hookReelSchema: HookReelProps = {
  hookLines: ['Écoutez bien', "ce qu'il dit", 'en direct'],
  highlight: ['dit', 'direct'],
  badge: 'En direct · IYAT TV',
  teaser: 'Regardez jusqu’au bout 👀',
  cta: 'Suivez PAS-PAS',
};

/** Charte PAS-PAS, relevée sur le logo officiel. */
const C = {
  bg: '#031a2e', // bleu nuit (fond)
  navy: '#065e9d', // bleu profond du logo
  blue: '#2175bb', // bleu « PAS-PAS »
  green: '#159741', // vert pirogue / bandeau
  greenDeep: '#0e7a33',
  cyan: '#26bbe5', // vagues
  sky: '#a0d1ef', // écume
  ink: '#ffffff',
  red: '#e5322d', // point « direct »
};

const VIDEO_W = 1080;
const VIDEO_H = Math.round((VIDEO_W * 9) / 16); // 608
const VIDEO_TOP = 780;

/** Petits zooms « punch-in » calés sur les moments où l'orateur s'anime. */
const PUNCHES: { at: number; scale: number }[] = [
  { at: 2.7, scale: 1.08 }, // « Facilement »
  { at: 13.2, scale: 1.12 },
  { at: 16.4, scale: 1.18 }, // gestes appuyés
  { at: 19.3, scale: 1.12 },
  { at: 23.3, scale: 1.06 },
];

const usePunchScale = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let scale = 1;
  for (const p of PUNCHES) {
    const start = Math.round(p.at * fps);
    if (frame < start) continue;
    const s = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 180 } });
    const release = interpolate(frame - start, [fps * 1.6, fps * 2.4], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    });
    scale = Math.max(scale, 1 + (p.scale - 1) * s * (1 - release));
  }
  return scale;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 750], [1.35, 1.5]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${drift})`, filter: 'blur(42px) saturate(1.3)', opacity: 0.55 }}>
        <OffthreadVideo src={staticFile('source.mp4')} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(3,26,46,0.94) 0%, rgba(6,94,157,0.55) 34%, rgba(6,94,157,0.5) 68%, rgba(3,26,46,0.96) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const normalize = (w: string) => w.toLowerCase().replace(/[’]/g, "'");

const HookTitle: React.FC<{ lines: string[]; highlight: string[] }> = ({ lines, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hl = new Set(highlight.map(normalize));
  let wordIndex = 0;

  // Respiration légère + secousse à l'arrivée du dernier mot
  const breathe = 1 + 0.012 * Math.sin((frame / fps) * Math.PI * 1.2);

  return (
    <div
      style={{
        position: 'absolute',
        top: 330,
        left: 60,
        right: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        transform: `scale(${breathe})`,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px' }}>
          {line.split(' ').map((word) => {
            const i = wordIndex++;
            const delay = 4 + i * 4;
            const s = spring({ frame: frame - delay, fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
            const isHl = hl.has(normalize(word));
            const boxGrow = spring({ frame: frame - delay - 6, fps, config: { damping: 18, stiffness: 140 } });
            return (
              <span
                key={i}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  fontFamily: 'Archivo',
                  fontWeight: 900,
                  fontStretch: '75%',
                  fontSize: 122,
                  lineHeight: 1.02,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: C.ink,
                  padding: '0 14px',
                  opacity: interpolate(s, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateY(${(1 - s) * 70}px) scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg)`,
                  textShadow: isHl ? 'none' : '0 6px 30px rgba(0,0,0,0.6)',
                }}
              >
                {isHl && (
                  <span
                    style={{
                      position: 'absolute',
                      inset: '8px 0 4px 0',
                      background: `linear-gradient(180deg, ${C.green}, ${C.greenDeep})`,
                      borderRadius: 14,
                      transform: `scaleX(${boxGrow}) rotate(-1.5deg)`,
                      transformOrigin: 'left center',
                      zIndex: -1,
                      boxShadow: `0 10px 40px ${C.green}66`,
                    }}
                  />
                )}
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Logo PAS-PAS : arrivée en rebond, puis léger tangage de pirogue. */
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 10, stiffness: 120 } });
  const sway = Math.sin((frame / fps) * Math.PI * 0.8) * 3;
  return (
    <Img
      src={staticFile('paspas-logo.png')}
      style={{
        position: 'absolute',
        top: 70,
        left: (1080 - 240) / 2,
        width: 240,
        height: 240,
        borderRadius: '50%',
        border: `6px solid ${C.ink}`,
        boxShadow: `0 12px 50px rgba(0,0,0,0.5), 0 0 0 10px ${C.blue}66`,
        transform: `scale(${s}) rotate(${(1 - s) * -90 + sway}deg)`,
      }}
    />
  );
};

const VideoCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 2, fps, config: { damping: 16, stiffness: 120 } });
  const punch = usePunchScale();
  const glow = 0.35 + 0.25 * Math.sin((frame / fps) * Math.PI * 2 * 0.5);

  return (
    <div
      style={{
        position: 'absolute',
        top: VIDEO_TOP,
        left: 0,
        width: VIDEO_W,
        height: VIDEO_H,
        overflow: 'hidden',
        borderTop: `8px solid ${C.blue}`,
        borderBottom: `8px solid ${C.green}`,
        boxShadow: `0 0 80px rgba(38,187,229,${glow})`,
        transform: `translateY(${(1 - enter) * 120}px)`,
        opacity: enter,
      }}
    >
      <OffthreadVideo
        src={staticFile('source.mp4')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${punch})` }}
      />
    </div>
  );
};

const Badge: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 18, fps, config: { damping: 14 } });
  const dot = Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25;
  return (
    <div
      style={{
        position: 'absolute',
        top: VIDEO_TOP + VIDEO_H + 56,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '16px 34px',
          borderRadius: 999,
          background: 'rgba(253,248,238,0.08)',
          border: '2px solid rgba(253,248,238,0.18)',
          fontFamily: 'Manrope',
          fontWeight: 700,
          fontSize: 40,
          color: C.ink,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: 99, background: C.red, opacity: dot, boxShadow: `0 0 20px ${C.red}` }} />
        {text}
      </div>
    </div>
  );
};

const Waveform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audio = useAudioData(staticFile('source-audio.wav'));
  if (!audio) return null;
  const bars = visualizeAudio({ fps, frame, audioData: audio, numberOfSamples: 16, smoothing: true });
  const mirrored = [...bars.slice().reverse(), ...bars];
  return (
    <div
      style={{
        position: 'absolute',
        top: VIDEO_TOP + VIDEO_H + 160,
        left: 0,
        right: 0,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {mirrored.map((v, i) => {
        const h = Math.max(10, Math.min(126, Math.sqrt(v) * 320));
        return <div key={i} style={{ width: 18, height: h, borderRadius: 9, background: i % 2 ? C.cyan : C.sky, opacity: 0.35 + 0.65 * Math.min(1, v * 6) }} />;
      })}
    </div>
  );
};

const Teaser: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 30, fps, config: { damping: 18 } });
  return (
    <div
      style={{
        position: 'absolute',
        top: VIDEO_TOP + VIDEO_H + 330,
        width: '100%',
        textAlign: 'center',
        fontFamily: 'Manrope',
        fontWeight: 700,
        fontSize: 50,
        color: C.ink,
        opacity: s * 0.9,
        transform: `translateY(${(1 - s) * 30}px)`,
      }}
    >
      {text}
    </div>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / (durationInFrames - 1);
  return (
    <div style={{ position: 'absolute', bottom: 90, left: 80, right: 80, height: 10, borderRadius: 10, background: 'rgba(253,248,238,0.15)' }}>
      <div style={{ width: `${p * 100}%`, height: '100%', borderRadius: 10, background: `linear-gradient(90deg, ${C.green}, ${C.cyan})`, boxShadow: `0 0 18px ${C.cyan}` }} />
    </div>
  );
};

const Cta: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 125 }}>
      <div
        style={{
          fontFamily: 'Archivo',
          fontWeight: 900,
          fontStretch: '80%',
          fontSize: 64,
          textTransform: 'uppercase',
          color: C.ink,
          background: `linear-gradient(180deg, ${C.green}, ${C.greenDeep})`,
          border: `4px solid ${C.ink}`,
          padding: '22px 46px',
          borderRadius: 20,
          transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
          boxShadow: `0 20px 60px ${C.green}88`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const HookReel: React.FC<HookReelProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const ctaFrom = durationInFrames - Math.round(2.6 * fps);
  return (
    <AbsoluteFill>
      <FontLoader />
      <Background />
      <Logo />
      <HookTitle lines={props.hookLines} highlight={props.highlight} />
      <VideoCard />
      <Badge text={props.badge} />
      <Waveform />
      <Sequence durationInFrames={ctaFrom}>
        <Teaser text={props.teaser} />
      </Sequence>
      <Sequence from={ctaFrom}>
        <Cta text={props.cta} />
      </Sequence>
      <ProgressBar />
    </AbsoluteFill>
  );
};
