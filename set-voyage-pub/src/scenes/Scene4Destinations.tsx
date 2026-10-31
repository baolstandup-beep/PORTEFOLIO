import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { AGENCE, DESTINATIONS, SCENES } from '../config';
import { KenBurns } from '../components/Media';
import { FlightRoute } from '../components/FlightRoute';
import { clamp, easeInOut, springIn } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const D = SCENES.destinations;
const N = DESTINATIONS.length;
const SLOT = Math.floor(D / N); // durée d'une destination
const OVERLAP = 14; // chevauchement entre deux destinations (wipe)

/** Une destination : photo immersive + nom géant + trajet. */
const Destination: React.FC<{ i: number; dur: number }> = ({ i, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = DESTINATIONS[i];

  // Entrée en volet diagonal (sauf la première, révélée par la transition de scène)
  const wipe = i === 0 ? 1 : interpolate(frame, [0, OVERLAP], [0, 1], { ...clamp, easing: easeInOut });
  const dir = i % 2 ? -1 : 1;
  const name = springIn(frame, fps, 8);
  const country = springIn(frame, fps, 16);
  const route = interpolate(frame, [6, dur - 10], [0, 1], { ...clamp, easing: easeInOut });

  const poly =
    dir > 0
      ? `polygon(${(1 - wipe) * 130}% 0, 130% 0, 130% 100%, ${(1 - wipe) * 130 - 30}% 100%)`
      : `polygon(-30% 0, ${wipe * 130}% 0, ${wipe * 130 - 30}% 100%, -30% 100%)`;

  return (
    <AbsoluteFill style={{ clipPath: poly }}>
      <KenBurns
        src={d.photo}
        duration={dur}
        from={{ scale: 1.35, x: dir * 60, y: 0 }}
        to={{ scale: 1.12, x: dir * -60, y: -30 }}
        position="50% 35%"
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(6,26,64,0.55) 0%, rgba(6,26,64,0) 30%, rgba(6,26,64,0.15) 55%, ${d.couleur}EE 100%)`,
        }}
      />
      {/* Trajet animé */}
      <AbsoluteFill style={{ top: 150, alignItems: 'center' }}>
        <FlightRoute from={AGENCE.villeDepart} to={d.ville} progress={route} accent={d.couleur === COULEURS.jaune ? COULEURS.jaune : COULEURS.jauneClair} />
      </AbsoluteFill>
      {/* Nom de la ville */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', padding: '0 80px 330px' }}>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontFamily: FONTS.titre,
              fontWeight: 900,
              fontSize: 190,
              lineHeight: 0.95,
              color: '#fff',
              letterSpacing: -4,
              transform: `translateY(${(1 - name) * 105}%) skewY(${(1 - name) * 6}deg)`,
              textShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
          >
            {d.ville}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 16, opacity: country, transform: `translateX(${(1 - country) * -40}px)` }}>
          <div style={{ width: 60 * country, height: 6, background: '#fff', borderRadius: 3 }} />
          <span style={{ fontFamily: FONTS.texte, fontWeight: 600, fontSize: 44, color: '#fff', letterSpacing: 3, textTransform: 'uppercase' }}>
            {d.pays}
          </span>
        </div>
      </AbsoluteFill>
      {/* Compteur */}
      <div style={{ position: 'absolute', right: 80, bottom: 340, fontFamily: FONTS.titre, fontWeight: 800, fontSize: 40, color: 'rgba(255,255,255,0.85)' }}>
        {String(i + 1).padStart(2, '0')}
        <span style={{ opacity: 0.5 }}> / {String(N).padStart(2, '0')}</span>
      </div>
    </AbsoluteFill>
  );
};

export const Scene4Destinations: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tag = springIn(frame, fps, 4);
  const out = interpolate(frame, [D - 20, D], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: COULEURS.bleuNuit, overflow: 'hidden' }}>
      {DESTINATIONS.map((_, i) => {
        const from = i * SLOT - (i ? OVERLAP : 0);
        const dur = i === N - 1 ? D - from : SLOT + (i ? OVERLAP : 0) + OVERLAP;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`Destination ${i + 1}`}>
            <Destination i={i} dur={dur} />
          </Sequence>
        );
      })}
      {/* Bandeau persistant */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 90,
          padding: '14px 28px',
          borderRadius: 999,
          background: COULEURS.rouge,
          color: '#fff',
          fontFamily: FONTS.texte,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 3,
          textTransform: 'uppercase',
          transform: `translateY(${(1 - tag) * -150}px)`,
          opacity: out,
        }}
      >
        Destinations phares
      </div>
    </AbsoluteFill>
  );
};
