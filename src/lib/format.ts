const formatter = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Madrid" });
export function formatDate(date: Date) { return formatter.format(date); }
