import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: ReactNode;
}

export default function FeatureCard({ title, desc, icon }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-950 p-5 sm:p-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-teal-400/15 text-teal-300">
        {icon}
      </span>
      <p className="mt-4 text-[15px] font-semibold tracking-tight text-white">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-white/70">{desc}</p>
    </div>
  );
}
