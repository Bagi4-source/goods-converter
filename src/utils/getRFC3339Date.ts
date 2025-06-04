export function getRFC3339Date(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const min = pad(date.getMinutes());

  // Смещение в минутах
  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? "+" : "-";
  const absOffset = Math.abs(tzOffset);
  const offsetHour = pad(Math.floor(absOffset / 60));
  const offsetMin = pad(absOffset % 60);

  return `${year}-${month}-${day}T${hour}:${min}${sign}${offsetHour}:${offsetMin}`;
}