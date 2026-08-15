export function safeHttpUrl(value: string) {
  try {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.username || url.password) return null;

    return url.toString();
  } catch {
    return null;
  }
}

