import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { services } from "@/lib/services";
import { ServicesMegaMenu } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

beforeEach(() => {
  navigation.pathname = "/";
});

describe("<ServicesMegaMenu />", () => {
  afterEach(() => vi.useRealTimers());

  function trigger() {
    return screen.getByRole("button", { name: "Services" });
  }

  it("is a disclosure: closed by default, panel linked by aria-controls", () => {
    render(<ServicesMegaMenu />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(trigger().getAttribute("aria-controls")!);
    expect(panel).toHaveAttribute("data-state", "closed");
  });

  it("opens on click and lists every service plus 'All services'", async () => {
    render(<ServicesMegaMenu />);
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const list = screen.getByRole("list", { name: "Services" });
    for (const service of services) {
      expect(within(list).getByRole("link", { name: new RegExp(service.name) })).toHaveAttribute(
        "href",
        service.href,
      );
    }
    expect(within(list).getByRole("link", { name: "All services" })).toHaveAttribute("href", "/services");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<ServicesMegaMenu />);
    await userEvent.click(trigger());
    screen.getByRole("link", { name: /Web Development/ }).focus();
    await userEvent.keyboard("{Escape}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("opens on mouse hover after the intent delay, and closes after the grace period", () => {
    vi.useFakeTimers();
    const { container } = render(<ServicesMegaMenu />);
    const wrapper = container.firstElementChild!;
    fireEvent.pointerEnter(wrapper, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(100));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    act(() => vi.advanceTimersByTime(60));
    expect(trigger()).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerLeave(wrapper, { pointerType: "mouse" });
    act(() => vi.advanceTimersByTime(250));
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    act(() => vi.advanceTimersByTime(60));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores touch hover so taps don't open-then-close it", () => {
    vi.useFakeTimers();
    const { container } = render(<ServicesMegaMenu />);
    fireEvent.pointerEnter(container.firstElementChild!, { pointerType: "touch" });
    act(() => vi.advanceTimersByTime(500));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on outside click", async () => {
    render(
      <div>
        <ServicesMegaMenu />
        <p>outside</p>
      </div>,
    );
    await userEvent.click(trigger());
    fireEvent.pointerDown(screen.getByText("outside"));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the route changes and reports open state", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<ServicesMegaMenu onOpenChange={onOpenChange} />);
    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    navigation.pathname = "/services/legal";
    rerender(<ServicesMegaMenu onOpenChange={onOpenChange} />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});

describe("<MobileNav />", () => {
  function dialog() {
    return document.querySelector("dialog")!;
  }

  it("opens the sheet from the menu button", async () => {
    render(<MobileNav />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(dialog()).not.toHaveAttribute("open");
    await userEvent.click(button);
    expect(dialog()).toHaveAttribute("open");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("contains every primary destination and both CTAs", async () => {
    render(<MobileNav />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const nav = within(dialog()).getByRole("navigation", { name: "Mobile" });
    for (const label of ["How it works", "Work", "About", "Careers"]) {
      expect(within(nav).getByRole("link", { name: label })).toBeInTheDocument();
    }
    for (const service of services) {
      expect(within(nav).getByRole("link", { name: service.shortName })).toHaveAttribute(
        "href",
        service.href,
      );
    }
    expect(within(dialog()).getByRole("link", { name: "Book a 20-minute call" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(within(dialog()).getByRole("link", { name: "Estimate savings" })).toBeInTheDocument();
  });

  it("closes from the close button and on link click", async () => {
    render(<MobileNav />);
    const open = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(open);
    await userEvent.click(within(dialog()).getByRole("button", { name: "Close menu" }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(open).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(open);
    await userEvent.click(within(dialog()).getByRole("link", { name: "Careers" }));
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("closes when the route changes", async () => {
    const { rerender } = render(<MobileNav />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    navigation.pathname = "/about";
    rerender(<MobileNav />);
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("marks the current page and expands Services on a service route", async () => {
    navigation.pathname = "/services/accounting";
    render(<MobileNav />);
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(within(dialog()).getByRole("link", { name: "Accounting" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(dialog().querySelector("details")).toHaveAttribute("open");
  });
});
