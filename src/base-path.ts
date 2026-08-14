/**
 * Vite injects the configured `base` ("/footprint/" on GitHub Pages, "/" in
 * dev) at build time. App-absolute paths like "/sources#boundary" must be
 * prefixed with it for hrefs, and stripped from it when reading the pathname.
 */
const base = import.meta.env.BASE_URL;

/** "/sources#boundary" -> "/footprint/sources#boundary" (base-aware href) */
export const withBase = (appPath: string): string =>
  base.replace(/\/$/, "") + appPath;

/** "/footprint/sources" -> "/sources" (base-relative app path) */
export const stripBase = (pathname: string): string => {
  const prefix = base.replace(/\/$/, "");
  const stripped = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname;
  return stripped === "" ? "/" : stripped;
};
