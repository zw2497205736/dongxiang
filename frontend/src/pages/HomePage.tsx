import { useEffect } from "react";
import { listArticles } from "../features/articles/api/articles";
import { ArticleCard } from "../features/articles/components/ArticleCard";
import { useRequest } from "../shared/hooks/useRequest";
import { Landscape } from "../shared/ui/Landscape";
import { RequestError } from "../shared/ui/RequestError";

export function HomePage() {
  const state = useRequest(listArticles);
  useEffect(() => {
    document.title = "东乡文化 · 从这里开始";
  }, []);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> 从故乡，重新出发
          </p>
          <h1 id="hero-title">
            熟悉的名字，
            <br />
            还有许多故事。
          </h1>
          <p className="hero-description">
            从一段文字开始，走近东乡的土地、语言与生活，
            <br className="desktop-break" />
            也走近属于自己的文化记忆。
          </p>
          <a className="button primary" href="#culture">
            开始探索 <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="hero-art">
          <Landscape />
          <span className="art-caption">山川之间 · 故事生长</span>
        </div>
      </section>

      {state.status === "loading" && (
        <p className="notice" role="status">
          正在打开文化故事……
        </p>
      )}
      {state.status === "error" && (
        <RequestError message={state.error.message} />
      )}
      {state.status === "ready" && (
        <section
          id="culture"
          className="culture-section"
          aria-labelledby="culture-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">CULTURE & STORIES</p>
              <h2 id="culture-title">先从了解开始</h2>
            </div>
            <span className="section-note">每一篇，都有来处</span>
          </div>
          {state.data.length === 0 ? (
            <p className="notice">文化故事正在整理，欢迎稍后再来。</p>
          ) : (
            <div className="article-list">
              {state.data.map((article) => (
                <ArticleCard article={article} key={article.slug} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
