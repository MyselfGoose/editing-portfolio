import { useEffect, useState } from "react";

/**
 * False on SSR and the first client render, true after mount.
 * Use to defer tier-dependent markup until after hydration.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // Intentionally flips after hydration so SSR and first client paint match.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate
    setMounted(true);
  }, []);

  return mounted;
}
