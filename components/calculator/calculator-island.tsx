"use client";

import { Suspense, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { applyPrefill, defaultInput, type RateCard } from "@/lib/calculator/model";
import { loadCalculatorInput } from "@/lib/calculator/storage";
import { BackOfficeCalculator } from "./back-office-calculator";

export interface CalculatorIslandProps {
  rateCard: RateCard | null;
  contactHref: string;
}

const noopSubscribe = () => () => {};

/**
 * Saved inputs (localStorage) can only be read after hydration, so the calculator
 * renders with defaults first, then remounts once with the saved inputs plus any
 * teaser hand-off (`?fn=finance&hours=25`), which wins over what was saved.
 * Same pattern as the contact form island.
 */
function CalculatorWithParams(props: CalculatorIslandProps) {
  const params = useSearchParams();
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const initialInput = hydrated
    ? applyPrefill(loadCalculatorInput() ?? defaultInput(), new URLSearchParams(params.toString()))
    : defaultInput();
  return (
    <BackOfficeCalculator
      key={hydrated ? "client" : "server"}
      initialInput={initialInput}
      interactive={hydrated}
      {...props}
    />
  );
}

export function CalculatorIsland(props: CalculatorIslandProps) {
  return (
    <Suspense
      fallback={<BackOfficeCalculator initialInput={defaultInput()} interactive={false} {...props} />}
    >
      <CalculatorWithParams {...props} />
    </Suspense>
  );
}
