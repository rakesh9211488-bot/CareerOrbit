export const CV_BUCKET = 'cvs';
export const MAX_CV_BYTES = 5 * 1024 * 1024;

export function ownsCV(path: unknown, userId: string): path is string {
  return typeof path === 'string' && path.startsWith(`${userId}/`) && path.split('/').length === 2 && !path.includes('..');
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const target = new URL(request.url);
  // Next.js can reconstruct its URL with a different internal hostname.
  target.host = request.headers.get('host') || target.host;
  return Boolean(origin && origin === target.origin);
}
