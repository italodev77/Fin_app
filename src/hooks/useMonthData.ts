import { useEffect, useState } from 'react';
import { getIncome, type IncomeData } from '@/db/income';
import { ensureMonth, listInstances } from '@/db/instances';
import { listTransactions } from '@/db/transactions';
import { computeIncome, type IncomeResult } from '@/domain/income';
import { summarizeMonth, type MonthSummary } from '@/domain/summary';
import { todayIso } from '@/domain/month';
import type { BillInstance, IsoDate, Month, Transaction } from '@/domain/types';
import { useApp } from '@/store/app';

export interface MonthData {
  month: Month;
  today: IsoDate;
  bills: BillInstance[];
  transactions: Transaction[];
  income: IncomeData;
  incomeResult: IncomeResult;
  summary: MonthSummary;
}

export function useMonthData(month: Month): MonthData | null {
  const version = useApp((state) => state.version);
  const [data, setData] = useState<MonthData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await ensureMonth(month);
      const [bills, transactions, income] = await Promise.all([
        listInstances(month),
        listTransactions(month),
        getIncome(month),
      ]);
      const today = todayIso();
      const incomeResult = computeIncome(income.plan, income.items);
      const summary = summarizeMonth({
        bills,
        transactions,
        incomeNetCents: incomeResult.netCents,
        today,
      });
      if (!cancelled) {
        setData({ month, today, bills, transactions, income, incomeResult, summary });
      }
    }

    load().catch((error) => console.warn('Falha ao carregar o mês', error));
    return () => {
      cancelled = true;
    };
  }, [month, version]);

  return data && data.month === month ? data : null;
}
