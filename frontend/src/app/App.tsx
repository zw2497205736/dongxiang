import { ArticlePage } from "../pages/ArticlePage";
import { HomePage } from "../pages/HomePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { resolveRoute } from "./routes";
import { SiteLayout } from "./SiteLayout";

/** 应用入口只负责选择页面；请求和页面内容放在各自的模块里。 */
export function App() {
  const route = resolveRoute(window.location.pathname);

  return (
    <SiteLayout>
      {route.page === "home" && <HomePage />}
      {route.page === "article" && <ArticlePage slug={route.slug} />}
      {route.page === "not-found" && <NotFoundPage />}
    </SiteLayout>
  );
}
