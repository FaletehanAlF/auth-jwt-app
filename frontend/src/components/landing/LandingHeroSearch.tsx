"use client";

import { useRouter } from "next/navigation";
import CurvedInput from "./CurvedInput";

export default function LandingHeroSearch() {
  const router = useRouter();
  return (
    <CurvedInput
      placeholder="Cari posisi atau keahlian..."
      buttonText="Cari"
      type="search"
      name="q"
      theme="light"
      bend={18}
      height={56}
      width="100%"
      cornerRadius={20}
      fontSize={14}
      borderWidth={1.5}
      backgroundColor="#ffffff"
      textColor="#0f172a"
      placeholderColor="#94a3b8"
      borderColor="#bae6fd"
      buttonColor="#0f172a"
      buttonTextColor="#ffffff"
      shadowSize="md"
      shadowColor="#022c5a"
      onSubmit={(value: string) => {
        const q = value.trim();
        router.push(q ? `/home?q=${encodeURIComponent(q)}` : "/home");
      }}
    />
  );
}
