import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OpsFeed } from "./ops-feed";

function rows() {
  return within(screen.getByTestId("ops-feed-rows")).queryAllByRole("listitem", { hidden: true });
}

describe("<OpsFeed />", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders six seed rows and the initial count", () => {
    render(<OpsFeed initialCount={38} startImmediately />);
    expect(rows()).toHaveLength(6);
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("38");
  });

  it("hides the ticking rows from assistive tech and provides a summary instead", () => {
    render(<OpsFeed startImmediately />);
    expect(screen.getByTestId("ops-feed-rows")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText(/Example of the live task log/)).toHaveClass("sr-only");
  });

  it("waits for the load sequence before ticking", () => {
    render(<OpsFeed initialCount={38} intervalMs={1000} />);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("38");
  });

  it("ticks on the interval once started", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.9); // never resolve the review item
    render(<OpsFeed initialCount={38} intervalMs={1000} startImmediately />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(Number(screen.getByTestId("ops-feed-count").textContent)).toBeGreaterThanOrEqual(40);
  });

  it("stops ticking when paused and resumes on demand", () => {
    render(<OpsFeed initialCount={38} intervalMs={1000} startImmediately />);
    fireEvent.click(screen.getByRole("button", { name: "Pause live feed" }));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByTestId("ops-feed-count")).toHaveTextContent("38");

    const resume = screen.getByRole("button", { name: "Resume live feed" });
    expect(resume).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(resume);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId("ops-feed-count")).not.toHaveTextContent("38");
  });

  it("filters rows by service", async () => {
    vi.useRealTimers(); // Motion drives exit animations with real frames
    render(<OpsFeed startImmediately intervalMs={60_000} />);
    fireEvent.click(screen.getByRole("tab", { name: "Finance" }));
    expect(screen.getByRole("tab", { name: "Finance" })).toHaveAttribute("aria-selected", "true");
    await waitFor(() => expect(rows()).toHaveLength(2));
    const finance = rows();
    finance.forEach((row) => expect(row).toHaveTextContent("FIN"));
  });

  it("supports arrow, Home and End keys with a roving tabindex", () => {
    render(<OpsFeed startImmediately />);
    const all = screen.getByRole("tab", { name: "All" });
    expect(all).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(all, { key: "ArrowRight" });
    const web = screen.getByRole("tab", { name: "Web" });
    expect(web).toHaveAttribute("aria-selected", "true");
    expect(web).toHaveFocus();
    expect(all).toHaveAttribute("tabindex", "-1");

    fireEvent.keyDown(web, { key: "ArrowLeft" });
    fireEvent.keyDown(screen.getByRole("tab", { name: "All" }), { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Legal" })).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(screen.getByRole("tab", { name: "Legal" }), { key: "Home" });
    expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "All" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Legal" })).toHaveAttribute("aria-selected", "true");
  });
});
