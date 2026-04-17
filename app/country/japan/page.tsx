import Link from "next/link";

export default function JapanDetailsPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 text-white"
      style={{ background: "linear-gradient(90deg, #1e1f29 0%, #2a2d34 100%)" }}
    >
      <section className="w-full max-w-sm rounded-2xl border border-[#3ED0C94D] bg-[#2A2D34CC] p-6">
        <h1 className="mb-2 text-2xl font-semibold">Japan</h1>
        <p className="mb-6 text-white/75">Visa Free - stay up to 90 days.</p>
        <Link
          href="/select-country"
          className="inline-block rounded-lg border border-[#3ED0C966] px-4 py-2 text-[#3ED0C9]"
        >
          Back to countries
        </Link>
      </section>
    </main>
  );
}
