import { Badge } from '@/components/ui';
import { STATUSES } from '@/lib/constants';

export function StatusBadge({ status }: { status: string }) {
  const s = STATUSES.find((x) => x.value === status);
  return <Badge tone={s?.tone ?? 'neutral'}>{s?.label ?? status}</Badge>;
}
