import Image from 'next/image';
import { cn } from '@/lib/utils';

const SIZES = { sm: 'h-9', md: 'h-11', lg: 'h-16', xl: 'h-20' } as const;

/** Logo officiel GRAPHIA (public/logo-graphia.png). Sur fond sombre (`light`), posé sur un pavé blanc. */
export function Logo({
  className,
  light = false,
  size = 'md',
  priority = false,
}: {
  className?: string;
  light?: boolean;
  size?: keyof typeof SIZES;
  priority?: boolean;
}) {
  const img = (
    <Image
      src="/logo-graphia.png"
      alt="GRAPHIA — Créer, Innover, Transformer"
      width={569}
      height={175}
      priority={priority}
      className={cn(SIZES[size], 'w-auto', !light && className)}
    />
  );
  if (!light) return img;
  return <span className={cn('inline-flex rounded-xl bg-white px-2.5 py-1.5', className)}>{img}</span>;
}
