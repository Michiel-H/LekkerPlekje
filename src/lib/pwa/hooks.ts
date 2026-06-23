import { useSyncExternalStore } from "react";

/**
 * True only after client hydration (false on the server and the first render).
 * Lets components gate window/navigator-dependent UI without a setState-in-effect.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function standaloneSnapshot(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari legacy flag
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Reactively tracks whether the app is running as an installed (standalone) PWA. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener("change", onChange);
      window.addEventListener("appinstalled", onChange);
      return () => {
        mq.removeEventListener("change", onChange);
        window.removeEventListener("appinstalled", onChange);
      };
    },
    standaloneSnapshot,
    () => false
  );
}
