export class HttpError extends Error {
  constructor(public readonly status: number) {
    super("内容暂时无法加载");
  }
}

/** 统一处理 HTTP 状态和 JSON 解析；文章等业务接口在 features 内定义。 */
export async function fetchJson<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new HttpError(response.status);
  return response.json() as Promise<T>;
}
