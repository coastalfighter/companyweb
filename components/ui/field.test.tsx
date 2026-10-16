import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

describe("<Field />", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Work email">
        <Input type="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Work email")).toHaveAttribute("type", "email");
  });

  it("describes the control with its hint", () => {
    render(
      <Field label="Company" hint="As it appears on invoices">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Company")).toHaveAccessibleDescription("As it appears on invoices");
  });

  it("marks the control invalid and describes it with the error", () => {
    render(
      <Field label="Company" hint="Legal name" error="We'd like to know who we're talking to.">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Company");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Legal name We'd like to know who we're talking to.");
  });

  it("announces required fields in text, not just with an asterisk", () => {
    render(
      <Field label="First name" required>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText(/First name/);
    expect(input).toHaveAttribute("aria-required", "true");
    expect(screen.getByText("(required)")).toHaveClass("sr-only");
  });

  it("works for textareas", () => {
    render(
      <Field label="Details">
        <Textarea />
      </Field>,
    );
    expect(screen.getByLabelText("Details").tagName).toBe("TEXTAREA");
  });

  it("shows the character counter near the limit", () => {
    render(
      <Field label="Details">
        <Textarea showCount maxLength={10} value="123456789" onChange={() => {}} />
      </Field>,
    );
    expect(screen.getByText("9 / 10")).toBeInTheDocument();
  });

  it("renders standalone inputs without field wiring", () => {
    render(<Input aria-label="Search" />);
    expect(screen.getByRole("textbox", { name: "Search" })).not.toHaveAttribute("aria-invalid");
  });
});
