#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"
./scripts/mysql.sh start
if [[ ! -d frontend/node_modules ]]; then
  (cd frontend && npm ci --cache ../.runtime/npm-cache)
fi
backend_pid=''
frontend_pid=''
cleanup() {
  trap - EXIT INT TERM
  [[ -z "$backend_pid" ]] || kill "$backend_pid" 2>/dev/null || true
  [[ -z "$frontend_pid" ]] || kill "$frontend_pid" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
./scripts/backend.sh >.runtime/backend.log 2>&1 &
backend_pid=$!
echo '正在启动 Java 后端，日志位于 .runtime/backend.log'
ready=false
for attempt in {1..120}; do
  if curl --fail --silent http://127.0.0.1:8080/api/articles >/dev/null; then ready=true; break; fi
  if ! kill -0 "$backend_pid" 2>/dev/null; then
    echo '后端启动失败，请查看 .runtime/backend.log' >&2
    exit 1
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then echo '后端启动超时，请查看日志。' >&2; exit 1; fi
(cd frontend && exec npm run dev) &
frontend_pid=$!
echo '本地页面：http://127.0.0.1:5173'
echo '按 Ctrl+C 停止前后端；数据库可用 ./scripts/mysql.sh stop 单独停止。'
while kill -0 "$backend_pid" 2>/dev/null && kill -0 "$frontend_pid" 2>/dev/null; do sleep 2; done
exit 1
