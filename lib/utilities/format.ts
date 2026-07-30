/** Formats an ISO timestamp as a relative time like "3 hours ago". */
export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  if (Number.isNaN(then)) return "recently";

  const seconds = Math.round((Date.now() - then) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: Array<
    [limit: number, divisor: number, unit: Intl.RelativeTimeFormatUnit]
  > = [
    [60, 1, "second"],
    [3600, 60, "minute"],
    [86400, 3600, "hour"],
    [604800, 86400, "day"],
    [2629800, 604800, "week"],
    [31557600, 2629800, "month"],
    [Infinity, 31557600, "year"],
  ];

  for (const [limit, divisor, unit] of units) {
    if (Math.abs(seconds) < limit) {
      return formatter.format(-Math.round(seconds / divisor), unit);
    }
  }
  return "recently";
}
