type SplitTextProps = {
  text: string;
  className?: string;
  delayStart?: number;
  charDelay?: number;
};

export default function SplitText({
  text,
  className,
  delayStart = 0,
  charDelay = 40,
}: SplitTextProps) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          aria-hidden="true"
          className="animate-split-char inline-block will-change-transform"
          style={{ animationDelay: `${delayStart + i * charDelay}ms` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
