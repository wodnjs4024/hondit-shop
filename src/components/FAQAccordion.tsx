import { useState } from "react";
import { faqs } from "../data/siteData";
import { trackFaqOpen } from "../lib/analytics";

export function FAQAccordion() {
  const [open, setOpen] = useState<string[]>([faqs[0].question]);

  const toggle = (question: string) => {
    setOpen((current) => {
      const next = current.includes(question)
        ? current.filter((item) => item !== question)
        : [...current, question];
      if (!current.includes(question)) trackFaqOpen(question);
      return next;
    });
  };

  return (
    <div className="faq-list">
      {faqs.map((item) => {
        const expanded = open.includes(item.question);
        return (
          <div className={`faq-item ${expanded ? "is-open" : ""}`} key={item.question}>
            <button type="button" aria-expanded={expanded} onClick={() => toggle(item.question)}>
              <span>{item.question}</span>
              <span aria-hidden="true">{expanded ? "−" : "+"}</span>
            </button>
            <div className="faq-item__answer">
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
