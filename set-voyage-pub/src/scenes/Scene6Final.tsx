import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { AGENCE } from '../config';
import { Sky } from '../components/Sky';
import { Plane } from '../components/Plane';
import { Logo } from '../components/Logo';
import { IconChat, IconPin, IconTel } from '../components/Icons';
import { clamp, easeInOut, springIn, springPop } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const FlyOver: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 120], [0, 1], { ...clamp, easing: easeInOut });
  return <Plane x={interpolate(t, [0, 1], [-500, 1600])} y={interpolate(t, [0, 1], [420, 170])} width={560} rotate={-8} trail={700} />;
};

const ContactLine: React.FC<{ delay: number; icon: React.ReactNode; label: string; value: string; big?: boolean }> = ({ delay, icon, label, value, big }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, delay);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: p, transform: `translateX(${(1 - p) * 80}px)` }}>
      <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
        {big && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `4px solid ${COULEURS.jaune}`,
              transform: `scale(${1 + ((frame % 30) / 30) * 0.6})`,
              opacity: 1 - (frame % 30) / 30,
            }}
          />
        )}
        <div style={{ width: 84, height: 84, borderRadius: '50%', background: big ? COULEURS.jaune : 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: FONTS.texte, fontWeight: 600, fontSize: 26, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>{label}</div>
        <div style={{ fontFamily: big ? FONTS.titre : FONTS.texte, fontWeight: big ? 900 : 600, fontSize: big ? 64 : 38, color: '#fff', lineHeight: 1.15 }}>{value}</div>
      </div>
    </div>
  );
};

export const Scene6Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panel = springIn(frame, fps, 34, { damping: 24 });
  const cta = springPop(frame, fps, 90);
  const pulse = 1 + Math.max(0, Math.sin((frame - 100) / 6)) * 0.04 * (frame > 100 ? 1 : 0);
  const slogan = springIn(frame, fps, 50);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Sky drift={0.8} sun={{ x: 540, y: 560 }} layers={[0, 1, 2]} />
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <FlyOver />
      </CameraMotionBlur>

      <AbsoluteFill style={{ alignItems: 'center', top: 330 }}>
        <Logo delay={4} emblem={250} textColor={COULEURS.bleuNuit} accentColor={COULEURS.rouge} showTagline={false} />
        <div
          style={{
            marginTop: 30,
            fontFamily: FONTS.titre,
            fontWeight: 800,
            fontSize: 58,
            color: COULEURS.bleuNuit,
            opacity: slogan,
            transform: `translateY(${(1 - slogan) * 30}px)`,
          }}
        >
          {AGENCE.slogan}
        </div>
      </AbsoluteFill>

      {/* Panneau contact qui monte du bas */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 900,
          background: `linear-gradient(170deg, ${COULEURS.bleu} 0%, ${COULEURS.bleuNuit} 75%)`,
          borderRadius: '70px 70px 0 0',
          transform: `translateY(${(1 - panel) * 950}px)`,
          padding: '80px 80px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 36,
          boxShadow: '0 -30px 80px rgba(6,26,64,0.35)',
        }}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 12, borderRadius: '70px 70px 0 0', background: `linear-gradient(90deg, ${COULEURS.jaune}, ${COULEURS.rouge})` }} />
        <ContactLine delay={48} big icon={<IconTel size={42} color={COULEURS.bleuNuit} />} label="Appelez-nous" value={AGENCE.telephone} />
        {AGENCE.whatsapp && <ContactLine delay={58} icon={<IconChat size={40} color="#fff" />} label="WhatsApp" value={AGENCE.whatsapp} />}
        <ContactLine delay={68} icon={<IconPin size={40} color="#fff" />} label="Notre agence" value={AGENCE.adresse} />
        <div
          style={{
            marginTop: 18,
            alignSelf: 'center',
            padding: '30px 70px',
            borderRadius: 999,
            background: COULEURS.rouge,
            color: '#fff',
            fontFamily: FONTS.titre,
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 1,
            transform: `scale(${cta * pulse})`,
            boxShadow: '0 20px 50px rgba(230,57,70,0.5)',
          }}
        >
          Réservez maintenant ✈
        </div>
        {AGENCE.siteOuReseau && (
          <div style={{ alignSelf: 'center', fontFamily: FONTS.texte, fontWeight: 600, fontSize: 32, color: 'rgba(255,255,255,0.7)', opacity: interpolate(frame, [110, 130], [0, 1], clamp) }}>
            {AGENCE.siteOuReseau}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
