export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return remainingMinutes === 0 ? "0h" : `${remainingMinutes}min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${String(remainingMinutes).padStart(2, "0")}`;
}

export function formatShortDate(isoDate: string | null) {
  if (!isoDate) {
    return "—";
  }

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function progressPercentage(completedMinutes: number, requiredMinutes: number) {
  if (requiredMinutes <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (completedMinutes / requiredMinutes) * 100));
}
