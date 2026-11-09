import { fetchJson } from "../../../shared/api/http";
import type { Article } from "../model/article";

// 所有文章接口地址集中在这里；页面无需知道后端地址与请求细节。
export function listArticles(signal: AbortSignal): Promise<Article[]> {
  return fetchJson<Article[]>("/api/articles", signal);
}

export function getArticle(
  slug: string,
  signal: AbortSignal,
): Promise<Article> {
  return fetchJson<Article>(
    `/api/articles/${encodeURIComponent(slug)}`,
    signal,
  );
}
