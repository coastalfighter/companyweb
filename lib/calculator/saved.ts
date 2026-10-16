/**
 * The tiny part of calculator storage the site header needs ("Pick up where you
 * left off"). Kept apart from ./storage.ts so the header doesn't pull the cost
 * model into every page's bundle.
 */
export const CALCULATOR_STORAGE_KEY = "akros:calculator";

/** For useSyncExternalStore: changes in this tab and in other tabs. */
export function subscribeCalculatorInput(onChange: () => void): () => void {
  window.addEventListener(CALCULATOR_STORAGE_KEY, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CALCULATOR_STORAGE_KEY, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function hasSavedCalculatorInput(): boolean {
  try {
    return localStorage.getItem(CALCULATOR_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
