/**
 * Extract a user-facing API error message.
 * Never returns Angular's "Http failure response for …" text.
 */
export function getApiErrorMessage(err: any, fallback = 'Request failed'): string {
  const body = err?.error;

  const normalize = (value: any): string | null => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const text = normalize(item);
        if (text) return text;
      }
      return null;
    }
    if (typeof value === 'object') {
      return normalize(value.message ?? value.error ?? value.msg ?? null);
    }
    const text = String(value).trim();
    if (!text || /^Http failure response for/i.test(text)) return null;
    // Ignore raw HTML error pages
    if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) return null;
    return text;
  };

  const fromBody =
    normalize(body?.response?.message) ||
    normalize(body?.message) ||
    normalize(typeof body === 'string' ? body : null) ||
    normalize(body?.errors) ||
    normalize(body?.error) ||
    normalize(body?.msg);

  if (fromBody) return fromBody;

  const statusText = normalize(err?.statusText);
  if (statusText) return statusText;

  if (err?.status === 404) return 'Not Found';
  if (err?.status === 400) return 'Bad Request';
  if (err?.status === 401) return 'Unauthorized';
  if (err?.status === 403) return 'Forbidden';
  if (err?.status === 500) return 'Server Error';

  return fallback;
}
