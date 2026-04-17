"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const COUNTRY_BY_CODE: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  AE: "United Arab Emirates",
  FR: "France",
};

export default function PassportPage() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("country") || "").toUpperCase();
  const countryName = COUNTRY_BY_CODE[code] || "Selected Passport";

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 text-white"
      style={{ background: "linear-gradient(90deg, #1e1f29 0%, #2a2d34 100%)" }}
    >
      <div className="w-full max-w-[390px] rounded-2xl border border-white/20 bg-white/5 p-8 text-center">
        <p className="mb-3 text-white/70">Passport selected</p>
        <h1 className="mb-6 text-3xl font-semibold">{countryName}</h1>
        <Link
          href="/select-passport"
          className="inline-block rounded-lg border border-[#3ED0C966] px-4 py-2 text-[#3ED0C9]"
        >
          Change selection
        </Link>
      </div>
    </main>
  );
}
