import { sanitizeInput, type CalculatorInput } from "./model";
import { CALCULATOR_STORAGE_KEY } from "./saved";

export { CALCULATOR_STORAGE_KEY, hasSavedCalculatorInput, subscribeCalculatorInput } from "./saved";

/**
 * The calculator's inputs in localStorage (blueprint F4: "returning visitors
 * resume"). Inputs only, never results or contact details. Every read goes back
 * through sanitizeInput, and storage being unavailable (private mode, blocked
 * cookies) is never an error: the calculator just starts fresh.
 */
const VERSION = 1;

interface Stored {
  v: number;
  input: unknown;
  savedAt: number;
}

export function loadCalculatorInput(): CalculatorInput | null {
  try {
    const raw = localStorage.getItem(CALCULATOR_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    return stored.v === VERSION ? sanitizeInput(stored.input) : null;
  } catch {
    return null;
  }
}

export function saveCalculatorInput(input: CalculatorInput): void {
  try {
    const stored: Stored = { v: VERSION, input, savedAt: Date.now() };
    localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(stored));
    window.dispatchEvent(new Event(CALCULATOR_STORAGE_KEY));
  } catch {
    // Storage full or blocked: resuming is a convenience, not a requirement.
  }
}

export function clearCalculatorInput(): void {
  try {
    localStorage.removeItem(CALCULATOR_STORAGE_KEY);
    window.dispatchEvent(new Event(CALCULATOR_STORAGE_KEY));
  } catch {
    // Nothing to clear.
  }
}
