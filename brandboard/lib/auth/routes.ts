/** Routes that require an authenticated session. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/new",
  "/projects",
  "/settings",
] as const;

export const AUTH_ROUTE = "/login";

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === AUTH_ROUTE;
}
