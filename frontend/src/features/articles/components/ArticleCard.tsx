import { Landscape } from "../../../shared/ui/Landscape";
import type { Article } from "../model/article";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      className="article-card"
      href={`/culture/${encodeURIComponent(article.slug)}`}
    >
      <div className="card-art">
        <Landscape compact />
      </div>
      <div className="card-copy">
        <span className="category">文化入门</span>
        <h3>{article.title}</h3>
        <p>{article.summary}</p>
        <span className="read-link">
          读一读这个故事 <span aria-hidden="true">↗</span>
        </span>
      </div>
    </a>
  );
}
