import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Slider } from "@/components/ui/slider";
import { sampleRateCard } from "@/content/samples";
import { defaultInput } from "@/lib/calculator/model";
import { CALCULATOR_STORAGE_KEY, loadCalculatorInput } from "@/lib/calculator/storage";
import { BackOfficeCalculator } from "./back-office-calculator";

beforeEach(() => {
  localStorage.clear();
  // scrollIntoView is not implemented in jsdom.
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.useRealTimers());

function renderCalculator(rateCard = null as typeof sampleRateCard | null, input = defaultInput()) {
  return render(
    <BackOfficeCalculator initialInput={input} rateCard={rateCard} contactHref="/contact" interactive />,
  );
}

const results = () => screen.getByRole("region", { name: /Results/ });
const enable = (name: RegExp) => fireEvent.click(screen.getByRole("checkbox", { name }));

describe("<Slider />", () => {
  it("moves ±10 on PageUp / PageDown within bounds", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        id="s"
        value={195}
        min={0}
        max={200}
        onValueChange={onValueChange}
        valueText="195 hours a week"
        tooltip="195h"
        aria-describedby="x"
      />,
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuetext", "195 hours a week");
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(200);
    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(onValueChange).toHaveBeenLastCalledWith(185);
  });
});

describe("<BackOfficeCalculator /> without a rate card (live site)", () => {
  it("starts empty and explains what to do", () => {
    renderCalculator();
    expect(within(results()).getByText(/Turn on the work your team does/)).toBeInTheDocument();
  });

  it("shows today's cost and hours, but no Akrostech cost or savings", () => {
    renderCalculator();
    enable(/Finance & payroll/);
    fireEvent.click(screen.getByRole("button", { name: /A full person/ }));
    const panel = results();
    expect(within(panel).getByText("$174,000")).toBeInTheDocument();
    expect(within(panel).getByText("1,920")).toBeInTheDocument();
    expect(within(panel).getByText("≈ 0.9 FTE of your controller's time")).toBeInTheDocument();
    expect(within(panel).queryByText("Estimated Akrostech cost")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Annual savings")).not.toBeInTheDocument();
    expect(within(panel).getByText(/written quote within 48 hours/)).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /Book a call to validate/ })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("uses an edited salary and overhead", () => {
    renderCalculator();
    enable(/Finance & payroll/);
    fireEvent.click(screen.getByRole("button", { name: /A full person/ }));
    fireEvent.change(screen.getByRole("textbox", { name: /Annual salary/ }), {
      target: { value: "104,000" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /overhead/ }), { target: { value: "0" } });
    // 1,920h × $104,000 / 2,080 = $96,000.
    expect(within(results()).getByText("$96,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset to the \$145,000 preset/ })).toBeInTheDocument();
  });

  it("asks for a salary instead of guessing one outside the US", () => {
    renderCalculator();
    fireEvent.change(screen.getByRole("combobox", { name: /in-house team/ }), { target: { value: "uk-eu" } });
    enable(/Legal ops/);
    expect(screen.getByRole("textbox", { name: /Annual salary/ })).toHaveValue("");
    expect(screen.getByText(/don't have sourced salary data for this region/)).toBeInTheDocument();
    expect(within(results()).getByText(/Add a salary for Legal ops/)).toBeInTheDocument();
  });

  it("saves only after a change, and Start over clears it", () => {
    renderCalculator();
    expect(localStorage.getItem(CALCULATOR_STORAGE_KEY)).toBeNull();
    enable(/Hiring/);
    expect(loadCalculatorInput()?.functions.hiring.enabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(localStorage.getItem(CALCULATOR_STORAGE_KEY)).toBeNull();
    expect(screen.getByRole("checkbox", { name: /Hiring/ })).not.toBeChecked();
  });

  it("announces a settled summary to screen readers", () => {
    vi.useFakeTimers();
    renderCalculator();
    enable(/Website/);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.querySelector('[aria-live="polite"]')).toHaveTextContent(
      "Your team spends about 10 hours a week on work Akrostech could run.",
    );
  });
});

describe("<BackOfficeCalculator /> with a rate card (preview)", () => {
  it("shows our cost and savings as ranges, break-even and the comparison", () => {
    renderCalculator(sampleRateCard);
    enable(/Finance & payroll/);
    fireEvent.click(screen.getByRole("button", { name: /A full person/ }));
    const panel = results();
    expect(within(panel).getByText("$61K – $92K/yr")).toBeInTheDocument();
    expect(within(panel).getByText("$82K – $113K")).toBeInTheDocument();
    expect(within(panel).getByText("Month 1")).toBeInTheDocument();
    expect(
      within(panel).getByText(/In-house today \$174,000 a year; Akrostech \$61K – \$92K a year/),
    ).toBeInTheDocument();
  });
});

describe("mobile steps", () => {
  it("walks through the steps with Next / See results / Back", () => {
    renderCalculator();
    const steps = screen.getByRole("list", { name: "Steps" });
    expect(within(steps).getByRole("button", { name: "1. Your team" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Next" })[0]!);
    expect(within(steps).getByRole("button", { name: "2. The work" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    fireEvent.click(screen.getAllByRole("button", { name: "See results" })[0]!);
    expect(within(steps).getByRole("button", { name: "3. Results" })).toHaveAttribute("aria-current", "step");
  });

  it("shows every step before hydration", () => {
    render(
      <BackOfficeCalculator
        initialInput={defaultInput()}
        rateCard={null}
        contactHref="/contact"
        interactive={false}
      />,
    );
    expect(screen.queryByRole("list", { name: "Steps" })).not.toBeInTheDocument();
    expect(document.querySelector(".max-lg\\:hidden")).toBeNull();
  });
});
