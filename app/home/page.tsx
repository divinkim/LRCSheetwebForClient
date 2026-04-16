"use client";
import dynamic from "next/dynamic";

// wrapper client-only
const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false });

export default function Page() {
  return <HomeClient />;
}