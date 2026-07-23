import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames, and catch all root paths to redirect them
  matcher: ['/', '/(tr|en|ar)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
