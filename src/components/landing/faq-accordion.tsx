"use client";
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FAQS } from "@/lib/constants/faqs";

export function FaqAccordion() {
  const [open, setOpen] = useState<number>(0);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {FAQS.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={item.q} className={idx !== FAQS.length - 1 ? "border-b border-border" : ""}>
            <button type="button" onClick={() => setOpen(isOpen ? -1 : idx)} className="flex w-full items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left transition-colors hover:bg-muted/40" aria-expanded={isOpen}>
              <span className="text-[13px] sm:text-sm font-semibold text-foreground pr-2">{item.q}</span>
              <span className={["inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors", isOpen ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"].join(" ")} aria-hidden>
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            <div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden"><p className="px-4 sm:px-6 pb-4 sm:pb-5 text-[13px] sm:text-sm leading-6 text-muted-foreground">{item.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
