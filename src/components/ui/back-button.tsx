"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-6 left-6 z-10 inline-flex items-center gap-2 rounded-full border border-border-soft bg-white/80 px-4 py-2 style-caption font-semibold text-ink shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md active:scale-95 cursor-pointer"
    >
      <span className="text-base leading-none">←</span>
      <span>Back</span>
    </button>
  );
}