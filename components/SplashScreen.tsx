import Image from "next/image";

export default function SplashScreen() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#1E1F29]">
      <div className="relative mx-auto h-screen aspect-[390/844] max-w-full">
        <Image
          src="/Loading.svg"
          alt="Safrah loading screen"
          fill
          priority
          className="object-contain"
        />
        <div className="pointer-events-none absolute left-1/2 top-[69.2%] h-1 w-[16.5%] -translate-x-1/2 overflow-hidden rounded-full bg-[#2a324f]">
          <div className="h-full w-[45%] animate-[safrah-sweep_1.35s_ease-in-out_infinite] rounded-full bg-[#3ED0C9]" />
        </div>
      </div>
    </div>
  );
}
