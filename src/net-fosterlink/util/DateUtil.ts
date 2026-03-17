export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Parses an API date value (ISO string or epoch ms number) into a Date, or null if missing/invalid.
 *  ISO datetime strings without timezone info (e.g. "2026-03-12T09:11:27.000") are treated as UTC
 *  to avoid the browser parsing them as local time. */
export const parseApiDate = (value: string | number | null | undefined): Date | null => {
  if (value == null) return null;
  let d: Date;
  if (typeof value === "number") {
    d = new Date(value);
  } else {
    // ISO datetime without timezone suffix → append Z to force UTC interpretation
    const needsZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value) && !/Z|[+-]\d{2}:?\d{2}$/.test(value);
    d = new Date(needsZ ? value + "Z" : value);
  }
  return isNaN(d.getTime()) ? null : d;
};

export const formatRelativeDate = (date: Date | string | number): string => {
  const d = typeof date === "number" ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  // Date is in the future (e.g. timezone mismatch): show "Today" instead of "-1 days ago"
  if (days < 0) return "Today";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `on ${formatDate(d)}`;
};

export const formatJoinedText = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const created = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(created.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.4375));
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;

  if (years > 0) {
    return `Joined ${years} year${years === 1 ? "" : "s"} ago`;
  }
  return `Joined ${months <= 0 ? 1 : months} month${months === 1 ? "" : "s"} ago`;
};

export const formatJoinedTooltip = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return "";
  const created = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(created.getTime())) return "";

  const month = String(created.getMonth() + 1).padStart(2, "0");
  const day = String(created.getDate()).padStart(2, "0");
  const year = created.getFullYear();
  return `Joined on ${month}/${day}/${year}`;
};
