import { useState } from "react";

export function ShareLinkButton() {
  const [message, setMessage] = useState("");
  async function share() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("链接已复制，可以发给朋友");
      } else {
        setMessage("请复制浏览器地址，分享给朋友");
      }
    } catch {
      setMessage("请复制浏览器地址，分享给朋友");
    }
  }
  return (
    <div className="share-control">
      <button className="button secondary" onClick={share}>
        复制分享链接 <span aria-hidden="true">↗</span>
      </button>
      <p className="share-message" role="status">
        {message}
      </p>
    </div>
  );
}
