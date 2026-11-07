import { Fragment } from 'react';

/** Découpe un texte en mots animés un par un (déclenché par MotionRoot via data-words). */
export function Words({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(' ');
  return (
    <span data-words="" className={className} style={{ ['--d' as string]: delay }}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="word" style={{ ['--i' as string]: i }}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
