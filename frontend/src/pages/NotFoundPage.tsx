import { RequestError } from "../shared/ui/RequestError";

export function NotFoundPage() {
  return <RequestError message="这个页面暂时找不到了" />;
}
