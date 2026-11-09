#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME="$PROJECT_ROOT/.runtime"
MYSQL_BIN="${MYSQL_BIN:-/opt/homebrew/opt/mysql@8.4/bin}"
MYSQL_BASE="$(cd "$MYSQL_BIN/.." 2>/dev/null && pwd)" || {
  echo '找不到 MySQL。macOS 可先执行：brew install mysql@8.4' >&2
  exit 1
}
mkdir -p "$RUNTIME"

is_running() {
  [[ -f "$RUNTIME/mysql-root.cnf" ]] &&
    "$MYSQL_BIN/mysqladmin" --defaults-extra-file="$RUNTIME/mysql-root.cnf" ping --silent >/dev/null 2>&1
}

case "${1:-status}" in
  start)
    if is_running; then
      echo '项目 MySQL 已运行：127.0.0.1:3307'
      exit 0
    fi
    # 密码随机生成，只保存在已忽略的本地文件中；不写进命令行或日志。
    python3 - "$PROJECT_ROOT" <<'PY'
import os
import secrets
import shlex
import sys
from pathlib import Path

root = Path(sys.argv[1])
runtime = root / '.runtime'
os.umask(0o077)
env = root / '.env'
if env.exists():
    if not (runtime / 'mysql-root.cnf').exists():
        raise SystemExit('已有 .env，但缺少本地数据库配置；请检查后再启动，脚本不会覆盖。')
    sys.exit(0)
if (runtime / 'mysql-data' / 'mysql').exists():
    raise SystemExit('已有数据库但缺少凭据；请保留数据并检查配置，脚本不会重建。')
root_password = secrets.token_hex(24)
app_password = secrets.token_hex(24)
values = {
    'DB_URL': 'jdbc:mysql://127.0.0.1:3307/dongxiang_culture?characterEncoding=UTF-8&connectionTimeZone=UTC',
    'DB_USERNAME': 'dongxiang',
    'DB_PASSWORD': app_password,
}
env.write_text(''.join(f'{key}={shlex.quote(value)}\n' for key, value in values.items()))
(runtime / 'mysql-root.cnf').write_text(
    f'[client]\nuser=root\npassword={root_password}\nsocket="{runtime / "mysql.sock"}"\n'
)
(runtime / 'mysql-app.cnf').write_text(
    f'[client]\nuser=dongxiang\npassword={app_password}\nhost=127.0.0.1\nport=3307\nprotocol=TCP\ndefault-character-set=utf8mb4\n'
)
(runtime / 'mysql-init.sql').write_text(
    f"ALTER USER 'root'@'localhost' IDENTIFIED BY '{root_password}';\n"
    "CREATE DATABASE IF NOT EXISTS dongxiang_culture CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
    f"CREATE USER IF NOT EXISTS 'dongxiang'@'127.0.0.1' IDENTIFIED BY '{app_password}';\n"
    "GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON dongxiang_culture.* TO 'dongxiang'@'127.0.0.1';\n"
)
PY
    if [[ ! -d "$RUNTIME/mysql-data/mysql" ]]; then
      echo '初始化项目独立数据库……'
      "$MYSQL_BIN/mysqld" --no-defaults --initialize-insecure \
        --basedir="$MYSQL_BASE" --datadir="$RUNTIME/mysql-data" \
        --log-error="$RUNTIME/mysql-init.log"
    fi
    init_file=/dev/null
    if [[ -f "$RUNTIME/mysql-init.sql" ]]; then
      init_file="$RUNTIME/mysql-init.sql"
    fi
    nohup "$MYSQL_BIN/mysqld" --no-defaults \
      --basedir="$MYSQL_BASE" --datadir="$RUNTIME/mysql-data" \
      --socket="$RUNTIME/mysql.sock" --pid-file="$RUNTIME/mysql.pid" \
      --log-error="$RUNTIME/mysql.log" --bind-address=127.0.0.1 --port=3307 \
      --mysqlx=OFF --skip-name-resolve --init-file="$init_file" \
      >"$RUNTIME/mysql-console.log" 2>&1 </dev/null &
    server_pid=$!
    for attempt in {1..60}; do
      if is_running; then
        rm -f "$RUNTIME/mysql-init.sql"
        echo '项目 MySQL 已启动：127.0.0.1:3307'
        exit 0
      fi
      if ! kill -0 "$server_pid" 2>/dev/null; then
        echo "MySQL 启动失败，请查看 $RUNTIME/mysql.log" >&2
        exit 1
      fi
      sleep 1
    done
    echo "MySQL 启动超时，请查看 $RUNTIME/mysql.log" >&2
    exit 1
    ;;
  stop)
    if is_running; then
      "$MYSQL_BIN/mysqladmin" --defaults-extra-file="$RUNTIME/mysql-root.cnf" shutdown
      echo '项目 MySQL 已停止，数据保留在 .runtime/mysql-data'
    else
      echo '项目 MySQL 未运行'
    fi
    ;;
  sql)
    exec "$MYSQL_BIN/mysql" --defaults-extra-file="$RUNTIME/mysql-app.cnf" dongxiang_culture
    ;;
  status)
    if is_running; then echo '项目 MySQL 正在运行'; else echo '项目 MySQL 未运行'; exit 1; fi
    ;;
  *) echo '用法：./scripts/mysql.sh start | stop | status | sql' >&2; exit 1 ;;
esac
