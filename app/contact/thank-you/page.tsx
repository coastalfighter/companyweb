import type { Metadata } from "next";
import { ThankYou } from "@/components/contact/thank-you";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "Thanks",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="pt-32 pb-(--section-y) md:pt-40">
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-6 px-(--gutter)">
        <Eyebrow live>Message received</Eyebrow>
        <ThankYou />
      </div>
    </section>
  );
}
