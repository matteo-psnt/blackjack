import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [v, set] = useState(
    () => window.innerWidth < 640 && window.innerWidth < window.innerHeight,
  );
  useEffect(() => {
    const check = () => set(window.innerWidth < 640 && window.innerWidth < window.innerHeight);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return v;
}
