import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultInput } from "@/lib/calculator/model";
import { REPORT_ENDPOINT, ReportForm } from "./report-form";

const input = (() => {
  const i = defaultInput();
  i.functions.finance = { enabled: true, hoursPerWeek: 40, salary: 145_000 };
  return i;
})();

let createObjectURL: ReturnType<typeof vi.fn>;
beforeEach(() => {
  createObjectURL = vi.fn(() => "blob:report");
  Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

function open() {
  render(<ReportForm input={input} available />);
  fireEvent.click(screen.getByRole("button", { name: /Email me the PDF/ }));
  return screen.getByRole("form", { name: "Get the PDF report" });
}

function fill(name: string, email: string) {
  fireEvent.change(screen.getByRole("textbox", { name: /^Name/ }), { target: { value: name } });
  fireEvent.change(screen.getByRole("textbox", { name: /Work email/ }), { target: { value: email } });
}

describe("<ReportForm />", () => {
  it("is disabled until there's something to report", () => {
    render(<ReportForm input={defaultInput()} available={false} />);
    expect(screen.getByRole("button", { name: /Email me the PDF/ })).toBeDisabled();
  });

  it("checks name and email before sending anything", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    open();
    fireEvent.click(screen.getByRole("button", { name: "Get the PDF" }));
    expect(screen.getByText("Add your name so we know who the report is for.")).toBeInTheDocument();
    expect(screen.getByText("That doesn't look like an email address.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the inputs, downloads the PDF and says whether it was emailed", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("%PDF-1.7", { status: 200, headers: { "X-Report-Emailed": "true" } }));
    open();
    fill("Dana Whitfield", "dana@tidemark.example");
    fireEvent.click(screen.getByRole("button", { name: "Get the PDF" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Downloaded. A copy is on its way to dana@tidemark.example.",
      ),
    );
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe(REPORT_ENDPOINT);
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    expect(body).toMatchObject({ name: "Dana Whitfield", email: "dana@tidemark.example", website: "" });
    expect(body.input).toEqual(input);
    expect(body).not.toHaveProperty("rateCard");
    expect(createObjectURL).toHaveBeenCalled();
  });

  it("doesn't claim an email was sent when it wasn't", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("%PDF", { status: 200, headers: { "X-Report-Emailed": "false" } }),
    );
    open();
    fill("Dana", "dana@tidemark.example");
    fireEvent.click(screen.getByRole("button", { name: "Get the PDF" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Downloaded. Check your downloads folder."),
    );
  });

  it("shows server field errors and other failures", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json({ errors: { email: "That email is too long." } }, { status: 422 }))
      .mockResolvedValueOnce(
        Response.json({ error: "You've asked for a few reports already." }, { status: 429 }),
      );
    open();
    fill("Dana", "dana@tidemark.example");
    fireEvent.click(screen.getByRole("button", { name: "Get the PDF" }));
    expect(await screen.findByText("That email is too long.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Get the PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("You've asked for a few reports already.");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
