export function RequestError({ message }: { message: string }) {
  return (
    <section className="notice error" role="alert">
      <h1>{message}</h1>
      <p>可以重新加载，或回到首页看看。</p>
      <div className="error-actions">
        <button
          className="button primary"
          onClick={() => window.location.reload()}
        >
          重新加载
        </button>
        <a className="button secondary" href="/">
          返回首页
        </a>
      </div>
    </section>
  );
}
