export type Route =
  | { page: "home" }
  | { page: "article"; slug: string }
  | { page: "not-found" };

// 当前页面通过普通链接导航，浏览器每次打开地址时选择相应页面。
export function resolveRoute(pathname: string): Route {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/") return { page: "home" };

  const match = /^\/culture\/([^/]+)$/.exec(path);
  if (match) {
    try {
      return { page: "article", slug: decodeURIComponent(match[1]) };
    } catch {
      return { page: "not-found" };
    }
  }
  return { page: "not-found" };
}
