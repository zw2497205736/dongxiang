#!/usr/bin/env bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
  echo '请先运行 ./scripts/mysql.sh start，生成本地数据库配置。' >&2
  exit 1
fi
set -a
source "$PROJECT_ROOT/.env"
set +a
export MAVEN_USER_HOME="$PROJECT_ROOT/.runtime/maven-home"
cd "$PROJECT_ROOT/backend"
if [[ $# -eq 0 ]]; then set -- spring-boot:run; fi
exec ./mvnw -B -ntp "-Dmaven.repo.local=$PROJECT_ROOT/.runtime/m2" "$@"
