export interface FaqItem {
  /** Stable id: used for deep links (#faq-<id>). */
  id: string;
  question: string;
  answer: string;
}
