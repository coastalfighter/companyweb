import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VoltSlab } from "./volt-slab";

describe("<VoltSlab />", () => {
  const base = {
    heading: "Give us the work nobody wants. Keep the hours.",
    primary: { label: "Book a 20-minute call", href: "/contact" },
  };

  it("renders a labelled section with the primary CTA and the default email link", () => {
    render(<VoltSlab {...base} subheading="20 minutes. No slides." />);
    expect(screen.getByRole("region", { name: base.heading })).toBeInTheDocument();
    expect(screen.getByText("20 minutes. No slides.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Book a 20-minute call" })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Email us instead" })).toHaveAttribute(
      "href",
      "mailto:hello@akrosstech.com",
    );
  });

  it("can drop the secondary link", () => {
    render(<VoltSlab {...base} secondary={false} />);
    expect(screen.queryByRole("link", { name: "Email us instead" })).not.toBeInTheDocument();
  });

  it("only shows availability when it is provided", () => {
    const { rerender } = render(<VoltSlab {...base} />);
    expect(screen.queryByText(/Next available/)).not.toBeInTheDocument();
    rerender(<VoltSlab {...base} availability="Next available: Tomorrow, 10:00 AM EST" />);
    expect(screen.getByText("Next available: Tomorrow, 10:00 AM EST")).toBeInTheDocument();
  });
});
