export const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatRelativeDate = (date: Date | string): string => {
  const d = new Date(date);
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
