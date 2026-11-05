import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease} from '../components/anim';
import {PhoneIcon} from '../components/Icons';
import {Shine, Words} from '../components/Text';
import {C, FONT} from '../theme';

const PHONE = '+221 78 544 33 33';

const QrCard: React.FC<{src: string; label: string; color: string; delay: number}> = ({src, label, color, delay}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 12, mass: 0.8, stiffness: 120}});
  // ligne de scan : seulement pendant l'apparition, puis le QR reste parfaitement net
  const scanY = interpolate(f, [delay + 14, delay + 44], [0, 100], clamp);
  const scanO = interpolate(f, [delay + 12, delay + 18, delay + 40, delay + 48], [0, 1, 1, 0], clamp);
  return (
    <div
      style={{
        width: 440,
        textAlign: 'center',
        opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
        transform: `translateY(${(1 - s) * 120}px) scale(${0.85 + s * 0.15})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 440,
          height: 440,
          borderRadius: 26,
          background: C.white,
          boxShadow: '0 24px 60px rgba(14,89,46,0.22), 0 4px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* QR code original, simplement agrandi (jamais redessiné) */}
        <Img src={staticFile(src)} style={{width: 400, height: 400, objectFit: 'contain'}} />
        <div
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: `${6 + scanY * 0.88}%`,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(90deg, rgba(201,162,39,0), ${C.goldLight}, rgba(201,162,39,0))`,
            boxShadow: `0 0 18px ${C.goldLight}`,
            opacity: scanO,
          }}
        />
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color, marginTop: 22}}>{label}</div>
    </div>
  );
};

export const S6Contact: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: f - 10, fps, config: {damping: 12, mass: 0.7, stiffness: 130}});
  const pulse = 0.5 + 0.5 * Math.sin((f - 120) / 8);
  const glowOn = ease(f, 118, 135);
  const sub = ease(f, 128, 150);
  const phoneBox = ease(f, 92, 112);

  return (
    <AbsoluteFill>
      {/* bandeau vert supérieur : logo */}
      <div style={{position: 'absolute', top: 40, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Img
          src={staticFile('assets/logo-touba-ca-kanam.png')}
          style={{
            width: 210,
            height: 210,
            opacity: logo,
            transform: `scale(${0.5 + logo * 0.5})`,
            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))',
          }}
        />
      </div>

      <div style={{position: 'absolute', top: 360, width: '100%'}}>
        <Words text="SCANNEZ POUR" delay={16} stagger={5} style={{fontSize: 60, fontWeight: 900, color: C.greenText, letterSpacing: 6}} />
        <Words
          text="VOTRE CONTRIBUTION"
          delay={26}
          stagger={5}
          style={{fontSize: 60, fontWeight: 900, color: C.greenText, letterSpacing: 6, marginTop: 6}}
        />
      </div>

      <div style={{position: 'absolute', top: 560, width: '100%', display: 'flex', justifyContent: 'center', gap: 60}}>
        <QrCard src="assets/qr-wave.png" label="Wave" color="#0FA9DE" delay={34} />
        <QrCard src="assets/qr-orange-money.png" label="Orange Money" color={C.orange} delay={44} />
      </div>

      {/* numéro de téléphone */}
      <div style={{position: 'absolute', top: 1290, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div
          style={{
            position: 'relative',
            padding: '26px 50px',
            borderRadius: 999,
            background: C.green,
            transform: `scale(${0.8 + phoneBox * 0.2})`,
            opacity: phoneBox,
            boxShadow: `0 0 ${glowOn * (30 + pulse * 40)}px rgba(241,212,122,${0.35 + 0.4 * glowOn * pulse}), 0 20px 50px rgba(14,89,46,0.3)`,
            border: `3px solid ${C.gold}`,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <PhoneIcon size={64} color={C.goldLight} />
          <Shine at={150} dur={30}>
            <div style={{display: 'flex', fontFamily: FONT, fontWeight: 900, fontSize: 80, color: C.white, whiteSpace: 'pre'}}>
              {PHONE.split('').map((ch, i) => {
                const s = spring({frame: f - 96 - i * 1.6, fps, config: {damping: 12, mass: 0.5, stiffness: 170}});
                return (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
                      transform: `translateY(${(1 - s) * -50}px)`,
                    }}
                  >
                    {ch}
                  </span>
                );
              })}
            </div>
          </Shine>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 48,
            color: C.greenSoft,
            marginTop: 30,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 24}px)`,
          }}
        >
          Wave &amp; Orange Money
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1640,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          color: C.greenText,
          opacity: ease(f, 160, 184),
        }}
      >
        <div style={{fontWeight: 800, fontSize: 40, letterSpacing: 3}}>INAUGURATION · DAARA TÀNNEEF</div>
        <div style={{fontWeight: 600, fontSize: 36, marginTop: 10, color: C.greenSoft}}>Dimanche 08 novembre 2026 · Ndaam</div>
      </div>
    </AbsoluteFill>
  );
};
