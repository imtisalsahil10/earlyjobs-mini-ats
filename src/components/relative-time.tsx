import { formatDistanceToNow } from "date-fns";

/**
 * Relative labels are derived from the current clock, so the server render and
 * the client hydration can legitimately disagree by a tick. The machine-readable
 * `dateTime` stays authoritative, so the text mismatch is safe to suppress.
 */
export function RelativeTime({
  value,
  className,
}: {
  value: Date;
  className?: string;
}) {
  return (
    <time
      dateTime={value.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {formatDistanceToNow(value, { addSuffix: true })}
    </time>
  );
}
