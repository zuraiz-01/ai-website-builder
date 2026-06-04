"use client";

import { useState } from "react";
import { PlusIcon } from "./Icons";

const faqs = [
  {
    q: "Can I export the generated website?",
    a: "Yes. You can download your generated website as a ZIP file containing clean, production-ready HTML, CSS, and JavaScript. There are no watermarks or restrictions on the free plan.",
  },
  {
    q: "Does it generate responsive websites?",
    a: "Absolutely. Every website generated is fully responsive and looks great on desktop, tablet, and mobile devices. You can preview all three viewports in the editor before exporting.",
  },
  {
    q: "Can I edit the website after generation?",
    a: "Yes. You can use the chat-based editor to ask the AI to make changes — update copy, swap colors, add sections, or tweak layouts. Changes appear in the live preview within seconds.",
  },
  {
    q: "Is Firebase required?",
    a: "Firebase powers authentication and project storage in the cloud. You don't need to set it up yourself — we handle all of that. Your account and saved projects are secured through Firebase Auth and Firestore.",
  },
  {
    q: "Can I use my own OpenRouter API key?",
    a: "Pro and Team users can plug in their own OpenRouter API key to use their preferred models and manage their own usage. The free plan uses our shared key with sensible rate limits.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`glass rounded-2xl overflow-hidden transition border ${
                  isOpen ? "border-violet-500/40" : "border-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-medium text-zinc-100">
                    {f.q}
                  </span>
                  <PlusIcon
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
