import { useEffect, useState } from 'react';
import { listTemplates } from '@/db/templates';
import type { BillTemplate } from '@/domain/types';
import { useApp } from '@/store/app';

export function useTemplates(): BillTemplate[] | null {
  const version = useApp((state) => state.version);
  const [templates, setTemplates] = useState<BillTemplate[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listTemplates()
      .then((list) => {
        if (!cancelled) setTemplates(list);
      })
      .catch((error) => console.warn('Falha ao carregar contas', error));
    return () => {
      cancelled = true;
    };
  }, [version]);

  return templates;
}
