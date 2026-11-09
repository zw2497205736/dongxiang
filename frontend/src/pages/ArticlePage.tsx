import { useCallback, useEffect } from "react";
import { getArticle } from "../features/articles/api/articles";
import { HttpError } from "../shared/api/http";
import { useRequest } from "../shared/hooks/useRequest";
import { Landscape } from "../shared/ui/Landscape";
import { RequestError } from "../shared/ui/RequestError";
import { ShareLinkButton } from "../shared/ui/ShareLinkButton";

export function ArticlePage({ slug }: { slug: string }) {
  const loadArticle = useCallback(
    (signal: AbortSignal) => getArticle(slug, signal),
    [slug],
  );
  const state = useRequest(loadArticle);

  useEffect(() => {
    document.title =
      state.status === "ready"
        ? `${state.data.title} · 东乡文化`
        : "东乡文化 · 从这里开始";
  }, [state]);

  if (state.status === "loading")
    return (
      <p className="notice" role="status">
        正在打开文化故事……
      </p>
    );
  if (state.status === "error") {
    const message =
      state.error instanceof HttpError && state.error.status === 404
        ? "这篇文章暂时找不到了"
        : state.error.message;
    return <RequestError message={message} />;
  }

  const article = state.data;
  return (
    <article className="article-page">
      <a className="back-link" href="/">
        ← 返回文化探索
      </a>
      <header className="article-heading">
        <span className="category">文化入门</span>
        <h1>{article.title}</h1>
        <p className="article-summary">{article.summary}</p>
      </header>
      <div className="article-illustration">
        <Landscape />
      </div>
      <div className="article-body">
        {article.body
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
      </div>
      <aside className="source-box" aria-label="资料来源">
        <span className="source-icon" aria-hidden="true">
          ↗
        </span>
        <div>
          <h2>让每一段介绍，都有来处</h2>
          <p>本文依据以下资料整理，欢迎阅读原始介绍。</p>
          <a
            href={
              /^https?:\/\//.test(article.sourceUrl)
                ? article.sourceUrl
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {article.sourceName} ↗
          </a>
        </div>
      </aside>
      <ShareLinkButton />
    </article>
  );
}
