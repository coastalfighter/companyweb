import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("<Button />", () => {
  it("renders a type=button by default so it never submits a form by accident", () => {
    render(<Button>Book a call</Button>);
    expect(screen.getByRole("button", { name: "Book a call" })).toHaveAttribute("type", "button");
  });

  it("respects an explicit submit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables and marks busy while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Sending…
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Sending…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders its child element with asChild (e.g. a link)", () => {
    render(
      <Button asChild iconRight="arrow">
        <a href="/contact">Book a call</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Book a call" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link.className).toContain("bg-accent");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="ghost" size="lg">
        Ghost
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Ghost" });
    expect(button.className).toContain("border-line-strong");
    expect(button.className).toContain("h-12");
  });
});
