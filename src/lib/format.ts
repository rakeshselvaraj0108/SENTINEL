export function truncateHash(hash: string, headLen = 8, tailLen = 6): string {
  if (hash.length <= headLen + tailLen + 1) return hash;
  return `${hash.slice(0, headLen)}…${hash.slice(-tailLen)}`;
}

export function formatTimestampUtc(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes()
  )}:${pad(d.getUTCSeconds())} UTC`;
}
