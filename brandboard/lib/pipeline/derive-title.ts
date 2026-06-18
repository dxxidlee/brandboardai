export function deriveTitle(prompt: string): string {
  const trimmed = prompt.trim();
  const withoutPrefix = trimmed.replace(/^audit\s+/i, "");
  return withoutPrefix.length > 0 ? withoutPrefix : trimmed;
}
