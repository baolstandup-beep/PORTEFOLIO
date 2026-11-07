'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui';

export function PrintButton() {
  return (
    <Button type="button" variant="dark" onClick={() => window.print()}>
      <Printer className="h-4 w-4" /> Imprimer / PDF
    </Button>
  );
}
