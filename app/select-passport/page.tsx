"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Languages, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const PASSPORT_OPTIONS = [
  { code: "US", label: "United States", flag: "US" },
  { code: "GB", label: "United Kingdom", flag: "GB" },
  { code: "CA", label: "Canada", flag: "CA" },
] as const;

function FlagIcon({ code }: { code: string }) {
  if (code === "US") {
    return (
      <svg viewBox="0 0 28 20" className="h-5 w-7 rounded-[2px]" aria-hidden="true">
        <rect width="28" height="20" fill="#fff" />
        <rect y="0" width="28" height="2" fill="#B22234" />
        <rect y="4" width="28" height="2" fill="#B22234" />
        <rect y="8" width="28" height="2" fill="#B22234" />
        <rect y="12" width="28" height="2" fill="#B22234" />
        <rect y="16" width="28" height="2" fill="#B22234" />
        <rect width="12" height="10" fill="#3C3B6E" />
      </svg>
    );
  }

  if (code === "GB") {
    return (
      <svg viewBox="0 0 28 20" className="h-5 w-7 rounded-[2px]" aria-hidden="true">
        <rect width="28" height="20" fill="#012169" />
        <path d="M0 2 3 0 28 16v4h-3L0 4V2Z" fill="#fff" />
        <path d="M28 2 25 0 0 16v4h3L28 4V2Z" fill="#fff" />
        <path d="M0 3.2 1.8 2 28 17.6V20h-1.8L0 4.4V3.2Z" fill="#C8102E" />
        <path d="M28 3.2 26.2 2 0 17.6V20h1.8L28 4.4V3.2Z" fill="#C8102E" />
        <rect x="11" width="6" height="20" fill="#fff" />
        <rect y="7" width="28" height="6" fill="#fff" />
        <rect x="12" width="4" height="20" fill="#C8102E" />
        <rect y="8" width="28" height="4" fill="#C8102E" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7 rounded-[2px]" aria-hidden="true">
      <rect width="28" height="20" fill="#fff" />
      <rect width="7" height="20" fill="#D80621" />
      <rect x="21" width="7" height="20" fill="#D80621" />
      <path
        d="M14 4.2 12.9 6.5l-1.7-.8.7 2-1.9.7 1.8 1.1-1.1 1.6 2.1-.3.1 2.4h2.2l.1-2.4 2.1.3-1.1-1.6 1.8-1.1-1.9-.7.7-2-1.7.8L14 4.2Z"
        fill="#D80621"
      />
    </svg>
  );
}

export default function SelectPassportPage() {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState<string>("US");
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return PASSPORT_OPTIONS;
    }
    return PASSPORT_OPTIONS.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#1e1f29_0%,#2a2d34_100%)] px-4 py-5 text-[#e8e8f0]">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <Image src="/Safrah.svg" alt="Safrah" width={122} height={38} priority className="mb-1 h-auto w-[122px]" />
            <p className="text-[18px] text-[#b8bac8]">Your travel guide, personalized.</p>
          </div>
          <button type="button" aria-label="Translate" className="rounded-md p-1 text-white">
            <Languages className="h-8 w-8" />
          </button>
        </header>

        <h1 className="mb-7 text-center text-[52px] font-semibold leading-none">Select Your Passport</h1>

        <section className="mb-4 rounded-[18px] border border-[#2d656c] bg-[#272831] px-4 py-3">
          <label className="flex items-center gap-3">
            <Search className="h-6 w-6 text-black" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country..."
              className="w-full bg-transparent text-[22px] text-[#aeb0c0] outline-none placeholder:text-[#9ea1b0]"
            />
          </label>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[#2d656c] bg-[#272831]">
          {visibleOptions.map((option, index) => (
            <button
              key={option.code}
              type="button"
              onClick={() => setSelectedCode(option.code)}
              className={`flex w-full items-center gap-3 px-4 py-5 text-left transition ${
                selectedCode === option.code ? "bg-[#454854]" : "bg-transparent"
              } ${index !== visibleOptions.length - 1 ? "border-b border-[#2d656c66]" : ""}`}
            >
              <FlagIcon code={option.flag} />
              <span className="text-[20px] font-semibold">{option.label}</span>
            </button>
          ))}
        </section>

        <p className="mx-auto mb-20 mt-10 max-w-[320px] text-center text-[22px] leading-8 text-[#b8bac8]">
          Get instant travel info based on your passport
        </p>

        <button
          type="button"
          onClick={() => {
            if (selectedCode === "US") {
              router.push("/select-country");
              return;
            }
            router.push(`/passport?country=${selectedCode}`);
          }}
          className="w-full rounded-[16px] border border-[#2d656c] bg-[#2a5f68] py-5 text-center text-[22px] font-semibold text-[#3dc6c0]"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
