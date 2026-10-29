export const config = {
  matcher: '/:path*',
};

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;
  const auth = request.headers.get('authorization');

  if (expected && auth) {
    try {
      const encoded = auth.split(' ')[1] || '';
      const decoded = atob(encoded);
      const colonIndex = decoded.indexOf(':');
      const pwd = colonIndex >= 0 ? decoded.slice(colonIndex + 1) : decoded;
      if (pwd === expected) {
        return;
      }
    } catch (e) {
      // fall through to the 401 below
    }
  }

  return new Response('Acceso restringido', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Master Coaching Boys"',
    },
  });
}
