import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type ContactState } from "@/lib/contact/state";
import { ContactForm, DRAFT_STORAGE_KEY, RESULT_STORAGE_KEY } from "./contact-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const submit = vi.hoisted(() => ({
  impl: vi.fn(async (_prev: ContactState, _form: FormData): Promise<ContactState> => ({ status: "idle" })),
}));
vi.mock("@/app/contact/actions", () => ({
  submitContact: (prev: ContactState, form: FormData) => submit.impl(prev, form),
}));

const empty = { services: [], nda: false, details: "" };

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/First name/), "Dana");
  await user.type(screen.getByLabelText(/Last name/), "Whitfield");
  await user.type(screen.getByLabelText(/Work email/), "dana@tidemark.example");
  await user.type(screen.getByLabelText(/^Company(?! size)/), "Tidemark");
  await user.selectOptions(screen.getByLabelText(/Company size/), "200–499");
  await user.click(screen.getByLabelText("Accounting"));
}

beforeEach(() => {
  sessionStorage.clear();
  push.mockReset();
  submit.impl.mockReset();
  submit.impl.mockResolvedValue({ status: "idle" });
});

describe("<ContactForm />", () => {
  it("labels every field and marks required ones", () => {
    render(<ContactForm prefill={empty} />);
    for (const label of [/First name/, /Last name/, /Work email/, /^Company(?! size)/, /Company size/]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("aria-required", "true");
    }
    expect(screen.getByRole("group", { name: /take off your plate/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send/ })).toHaveAttribute("type", "submit");
  });

  it("validates on blur with the blueprint's messages", async () => {
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await user.click(screen.getByLabelText(/First name/));
    await user.tab();
    expect(screen.getByLabelText(/First name/)).toBeInvalid();
    expect(screen.getByText("We'd like to know who we're talking to.")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/First name/), "Dana");
    expect(screen.getByLabelText(/First name/)).not.toBeInvalid();
  });

  it("blocks an invalid submit with a linked, focused error summary and doesn't call the server", async () => {
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await user.click(screen.getByRole("button", { name: /Send/ }));
    const summary = await screen.findByRole("alert");
    expect(summary).toHaveTextContent("things to fix");
    expect(summary).toHaveFocus();
    expect(within(summary).getAllByRole("link").length).toBeGreaterThanOrEqual(6);
    expect(submit.impl).not.toHaveBeenCalled();

    await user.click(within(summary).getByRole("link", { name: /Work email/ }));
    expect(screen.getByLabelText(/Work email/)).toHaveFocus();
  });

  it("warns softly about personal email without blocking", async () => {
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await user.type(screen.getByLabelText(/Work email/), "dana@gmail.com");
    await user.tab();
    expect(screen.getByText("A work email helps us prepare. Personal is fine too.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Work email/)).not.toBeInvalid();
  });

  it("applies prefills and reveals the optional phone field on request", async () => {
    const user = userEvent.setup();
    render(<ContactForm prefill={{ services: ["legal"], nda: true, details: "Security review" }} />);
    expect(screen.getByLabelText("Legal Assistance")).toBeChecked();
    expect(screen.getByLabelText("Send me a mutual NDA before our call")).toBeChecked();
    expect(screen.getByLabelText(/eating your team's week/)).toHaveValue("Security review");
    expect(screen.queryByLabelText(/^Phone/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add a phone number" }));
    expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument();
  });

  it("submits valid data, stores the result for the thank-you page and navigates", async () => {
    submit.impl.mockResolvedValue({ status: "success", firstName: "Dana", services: ["accounting"] });
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Send/ }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/contact/thank-you"));

    const data = submit.impl.mock.calls[0]![1];
    expect(data.get("email")).toBe("dana@tidemark.example");
    expect(data.getAll("services")).toEqual(["accounting"]);
    expect(data.get("website")).toBe("");
    expect(JSON.parse(sessionStorage.getItem(RESULT_STORAGE_KEY)!)).toMatchObject({ firstName: "Dana" });
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("keeps every answer when the server says it didn't send", async () => {
    submit.impl.mockResolvedValue({
      status: "error",
      message: "That didn't send. Email hello@akrosstech.com.",
    });
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Send/ }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("didn't send");
    expect(within(alert).getByRole("link", { name: "hello@akrosstech.com" })).toHaveAttribute(
      "href",
      "mailto:hello@akrosstech.com",
    );
    expect(screen.getByLabelText(/First name/)).toHaveValue("Dana");
    expect(screen.getByLabelText("Accounting")).toBeChecked();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows server-side field errors", async () => {
    submit.impl.mockResolvedValue({
      status: "invalid",
      errors: { email: "That doesn't look like an email address." },
    });
    const user = userEvent.setup();
    render(<ContactForm prefill={empty} />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Send/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Work email");
    expect(screen.getByLabelText(/Work email/)).toBeInvalid();
  });

  it("restores an unsent draft when asked to", () => {
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ firstName: "Priya", services: ["web-development"] }),
    );
    render(<ContactForm prefill={empty} restoreDraft />);
    expect(screen.getByLabelText(/First name/)).toHaveValue("Priya");
    expect(screen.getByLabelText("Web Development")).toBeChecked();
  });

  it("lets an explicit prefill win over a stored draft", () => {
    sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ firstName: "Priya", nda: false, details: "" }),
    );
    render(<ContactForm prefill={{ services: [], nda: true, details: "Security review" }} restoreDraft />);
    expect(screen.getByLabelText(/First name/)).toHaveValue("Priya");
    expect(screen.getByLabelText("Send me a mutual NDA before our call")).toBeChecked();
    expect(screen.getByLabelText(/eating your team's week/)).toHaveValue("Security review");
  });

  it("doesn't save a draft until the visitor edits something", () => {
    render(<ContactForm prefill={{ services: ["legal"], nda: false, details: "" }} />);
    expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("saves the draft as the visitor types", () => {
    render(<ContactForm prefill={empty} />);
    act(() => {
      fireEvent.change(screen.getByLabelText(/^Company(?! size)/), { target: { value: "Larkspur" } });
    });
    expect(JSON.parse(sessionStorage.getItem(DRAFT_STORAGE_KEY)!)).toMatchObject({ company: "Larkspur" });
  });
});
