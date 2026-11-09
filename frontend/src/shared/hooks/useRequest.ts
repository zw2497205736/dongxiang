import { useEffect, useState } from "react";
import { HttpError } from "../api/http";

type RequestState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: Error };

/** 为列表页和详情页统一管理加载、错误及离开页面时的请求取消。 */
export function useRequest<T>(
  load: (signal: AbortSignal) => Promise<T>,
): RequestState<T> {
  const [state, setState] = useState<RequestState<T>>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          error:
            error instanceof HttpError
              ? error
              : new Error("暂时连接不上，请稍后再试"),
        });
      });
    return () => controller.abort();
  }, [load]);

  return state;
}
