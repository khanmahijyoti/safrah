"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Languages, Search } from "lucide-react";
import { useRouter } from "next/navigation";

type VisaStatus = "Visa Free" | "eVisa" | "Visa Required";

type Destination = {
  id: string;
  country: string;
  note: string;
  status: VisaStatus;
  flagCode: "JP" | "AU" | "CN";
};

const destinations: Destination[] = [
  {
    id: "japan",
    country: "Japan",
    note: "Stay up to 90 days",
    status: "Visa Free",
    flagCode: "JP",
  },
  {
    id: "australia",
    country: "Australia",
    note: "Electronic visa required",
    status: "eVisa",
    flagCode: "AU",
  },
  {
    id: "china",
    country: "China",
    note: "Embassy visit required",
    status: "Visa Required",
    flagCode: "CN",
  },
];

const filters = ["All", "Visa Free", "eVisa", "Visa Required"] as const;

export default function SelectCountryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const filterBarRef = useRef<HTMLElement | null>(null);
  const filterButtonRefs = useRef<Record<(typeof filters)[number], HTMLButtonElement | null>>({
    All: null,
    "Visa Free": null,
    eVisa: null,
    "Visa Required": null,
  });

  const filtered = useMemo(() => {
    return destinations.filter((item) => {
      const matchesText = item.country.toLowerCase().includes(query.trim().toLowerCase());
      const matchesFilter = activeFilter === "All" ? true : item.status === activeFilter;
      return matchesText && matchesFilter;
    });
  }, [activeFilter, query]);

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,#1e1f29_0%,#2a2d34_100%)] px-4 py-5 text-[#e8e8f0]">
      <div className="mx-auto w-full max-w-[390px]">
        <header className="mb-7 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label="Go back"
              onClick={() => router.push("/select-passport")}
              className="mt-1 rounded-md p-1 text-black"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-[24px] font-semibold leading-tight">United States Passport</h1>
              <p className="mt-1 text-[16px] text-[#b6b8c7]">Explore visa-free and visa-eligible destinations</p>
            </div>
          </div>

          <button type="button" className="rounded-md p-1 text-white" aria-label="Translate">
            <Languages className="h-7 w-7" />
          </button>
        </header>

        <section className="mb-5 rounded-[18px] border border-[#2d656c] bg-[#272831] px-4 py-3">
          <label className="flex items-center gap-3">
            <Search className="h-6 w-6 text-black" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search destinations..."
              className="w-full bg-transparent text-[15px] text-[#c6c8d7] outline-none placeholder:text-[#a7a9b9]"
            />
          </label>
        </section>

        <section
          ref={filterBarRef}
          className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                ref={(el) => {
                  filterButtonRefs.current[filter] = el;
                }}
                onClick={() => {
                  setActiveFilter(filter);
                  if (filter === "All") {
                    filterBarRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                    return;
                  }
                  filterButtonRefs.current[filter]?.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5 text-[14px] transition ${
                  active
                    ? "border-[#2d656c] bg-[#2a5f68] text-[#3dc6c0]"
                    : "border-[#2d656c] bg-[#272831] text-[#c2c4d3]"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full ${
                    filter === "All"
                      ? "bg-black"
                      : filter === "Visa Free"
                        ? "bg-[#17c79a]"
                        : filter === "eVisa"
                          ? "bg-[#f3a614]"
                          : "bg-[#ff4a4a]"
                  }`}
                />
                {filter}
              </button>
            );
          })}
        </section>

        <section className="space-y-4 pb-6">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-3xl border border-[#2d656c] bg-[#272831] px-4 py-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-12 items-center justify-center rounded-sm bg-white">
                    <FlagMark code={item.flagCode} />
                  </span>
                  <h2 className="text-[30px] font-semibold leading-none">{item.country}</h2>
                </div>

                <span
                  className={`inline-flex items-center gap-2 text-[18px] ${
                    item.status === "Visa Free"
                      ? "text-[#17c79a]"
                      : item.status === "eVisa"
                        ? "text-[#f3a614]"
                        : "text-[#ff4a4a]"
                  }`}
                >
                  <span className="inline-block h-3 w-3 rounded-full bg-current" />
                  {item.status}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-[17px] text-[#c0c2d2]">{item.note}</p>

                <button
                  type="button"
                  onClick={() => {
                    if (item.id === "japan") {
                      router.push("/visa");
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[16px] text-[#3dc6c0] transition hover:bg-[#3dc6c022] hover:text-[#56ded8]"
                >
                  View Details
                  <ArrowRight className="h-5 w-5 text-black" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function FlagMark({ code }: { code: "JP" | "AU" | "CN" }) {
  if (code === "JP") {
    return (
      <svg viewBox="0 0 48 32" className="h-full w-full" aria-hidden="true">
        <rect width="48" height="32" fill="#ffffff" />
        <circle cx="24" cy="16" r="9" fill="#bc002d" />
      </svg>
    );
  }

  if (code === "CN") {
    return (
      <svg viewBox="0 0 48 32" className="h-full w-full" aria-hidden="true">
        <rect width="48" height="32" fill="#de2910" />
        <text x="7" y="12" fontSize="9" fill="#ffde00">
          ★
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 32" className="h-full w-full" aria-hidden="true">
      <rect width="48" height="32" fill="#1e2f97" />
      <text x="6" y="12" fontSize="8" fill="#ffffff">
        ✶
      </text>
      <text x="13" y="9" fontSize="5" fill="#ffffff">
        ★
      </text>
      <text x="16" y="14" fontSize="5" fill="#ffffff">
        ★
      </text>
      <text x="11" y="17" fontSize="5" fill="#ffffff">
        ★
      </text>
      <text x="8" y="21" fontSize="5" fill="#ffffff">
        ★
      </text>
      <text x="15" y="21" fontSize="5" fill="#ffffff">
        ★
      </text>
    </svg>
  );
}
