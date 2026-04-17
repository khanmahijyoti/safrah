"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "../components/SplashScreen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/select-passport");
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return <SplashScreen />;
}
