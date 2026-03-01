import { useCallback, useEffect, useRef, useState } from 'react';

export function useBalanceCounter(
  currentBalance: number,
  beginDeal: () => void,
): {
  displayedBalance: number;
  balanceTrend: 'up' | 'down' | null;
  handleDeal: () => void;
  snapBaselineToPredeal: () => void;
} {
  const [displayedBalance, setDisplayedBalance] = useState(currentBalance);
  const [balanceTrend, setBalanceTrend] = useState<'up' | 'down' | null>(null);
  const balanceFromRef = useRef(currentBalance);
  const balanceRafRef = useRef<number>(0);
  const balanceTrendTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const preDealBalanceRef = useRef(currentBalance);

  const handleDeal = useCallback(() => {
    preDealBalanceRef.current = currentBalance;
    beginDeal();
  }, [currentBalance, beginDeal]);

  const snapBaselineToPredeal = useCallback(() => {
    balanceFromRef.current = preDealBalanceRef.current;
  }, []);

  useEffect(() => {
    const from = balanceFromRef.current;
    const to = currentBalance;
    if (from === to) return;

    setBalanceTrend(to > from ? 'up' : 'down');
    if (balanceTrendTimer.current) clearTimeout(balanceTrendTimer.current);
    cancelAnimationFrame(balanceRafRef.current);

    const duration = 600;
    const startTime = performance.now();

    const animate = (time: number) => {
      const t = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (to - from) * eased;
      balanceFromRef.current = value;
      setDisplayedBalance(Math.round(value));
      if (t < 1) {
        balanceRafRef.current = requestAnimationFrame(animate);
      } else {
        balanceFromRef.current = to;
        setDisplayedBalance(to);
        balanceTrendTimer.current = setTimeout(() => setBalanceTrend(null), 500);
      }
    };

    balanceRafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(balanceRafRef.current);
  }, [currentBalance]);

  return { displayedBalance, balanceTrend, handleDeal, snapBaselineToPredeal };
}
