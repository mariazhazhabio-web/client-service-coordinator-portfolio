"use client";
import { useCallback, useEffect, useState } from "react";

/** State persisted to localStorage (demo-only storage, never sent to a server). */
export function useLocalState<T>(key: string, initial: () => T) {
  const storageKey = `csc-demo:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* storage unavailable: keep in-memory state */
    }
    setLoaded(true);
  }, [storageKey]);
  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [loaded, storageKey, value]);
  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setValue(initial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);
  return [value, setValue, reset] as const;
}
