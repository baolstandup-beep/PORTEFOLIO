import React from 'react';
import {
  AbsoluteFill,
  Easing,
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
  cta: 'Abonne-toi pour la suite',
};

const C = {
  bg: '#0b0a08',
  ink: '#fdf8ee',
  gold: '#f5b301',
  goldDeep: '#c98a00',
  red: '#e5322d',
};

const VIDEO_W = 1080;
const VIDEO_H = Math.round((VIDEO_W * 9) / 16); // 608
const VIDEO_TOP = 700;

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
            'linear-gradient(180deg, rgba(11,10,8,0.92) 0%, rgba(11,10,8,0.55) 32%, rgba(11,10,8,0.55) 70%, rgba(11,10,8,0.95) 100%)',
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
        top: 150,
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
                  fontSize: 132,
                  lineHeight: 1.02,
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  color: isHl ? C.bg : C.ink,
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
                      background: `linear-gradient(180deg, ${C.gold}, ${C.goldDeep})`,
                      borderRadius: 14,
                      transform: `scaleX(${boxGrow}) rotate(-1.5deg)`,
                      transformOrigin: 'left center',
                      zIndex: -1,
                      boxShadow: `0 10px 40px ${C.gold}55`,
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
        borderTop: `6px solid ${C.gold}`,
        borderBottom: `6px solid ${C.gold}`,
        boxShadow: `0 0 80px rgba(245,179,1,${glow})`,
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
        top: VIDEO_TOP + VIDEO_H + 180,
        left: 0,
        right: 0,
        height: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      {mirrored.map((v, i) => {
        const h = Math.max(10, Math.min(150, Math.sqrt(v) * 360));
        return <div key={i} style={{ width: 18, height: h, borderRadius: 9, background: C.gold, opacity: 0.35 + 0.65 * Math.min(1, v * 6) }} />;
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
        top: VIDEO_TOP + VIDEO_H + 370,
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
      <div style={{ width: `${p * 100}%`, height: '100%', borderRadius: 10, background: C.gold, boxShadow: `0 0 18px ${C.gold}` }} />
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
          color: C.bg,
          background: C.gold,
          padding: '22px 46px',
          borderRadius: 20,
          transform: `scale(${s}) rotate(${(1 - s) * -8}deg)`,
          boxShadow: `0 20px 60px ${C.gold}66`,
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
