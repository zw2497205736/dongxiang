import type { ReactNode } from "react";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到正文
      </a>
      <header className="site-header shell">
        <a className="brand" href="/" aria-label="东乡文化首页">
          <span className="brand-mark" aria-hidden="true">
            东
          </span>
          <span>
            东乡文化<small>DONGXIANG CULTURE</small>
          </span>
        </a>
        <a className="header-link" href="/">
          文化探索 <span aria-hidden="true">↗</span>
        </a>
      </header>
      <main id="main-content" className="shell">
        {children}
      </main>
      <footer className="site-footer shell">
        <span>东乡文化</span>
        <p>一点点认识，一点点记录。</p>
      </footer>
    </>
  );
}
