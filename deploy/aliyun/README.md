# 阿里云部署配置模板

本目录对应已确认的系统架构：ECS 运行 Nginx 与 Java，RDS MySQL 独立保存业务数据。配置文件尚未应用到云端。

## 当前这一小步

先固定运行约定与配置位置。云资源、操作系统、地域、域名、证书与账号准备后，再逐步完成初始化、上传与启动。当前尚未采购 ECS 或 RDS。

| 文件 | 用途 |
| --- | --- |
| `backend.env.example` | RDS 内网连接与应用账号的配置格式 |
| `dongxiang.service` | 使用 systemd 运行 Java JAR，启用 cloud 配置 |
| `nginx.conf.example` | HTTPS、静态网页和 `/api` 转发模板 |
| `../../backend/src/main/resources/application-cloud.yml` | 云端连接池与 SQL 初始化策略 |

示例使用支持 systemd 的 Linux，Java 路径为 `/usr/bin/java`。实际操作系统与安装路径需要在开通 ECS 后核对。

## 服务器上的目录约定

```text
/opt/dongxiang/
├── backend/culture-platform.jar
└── frontend/                       frontend/dist/ 中的构建内容

/etc/dongxiang/backend.env          实际 RDS 连接凭据
/etc/systemd/system/dongxiang.service
/etc/nginx/conf.d/dongxiang.conf
/etc/ssl/dongxiang/                 实际域名对应的证书与私钥
```

前端是静态构建产物，云端运行不需要启动 Vite 开发服务。Java 只监听 `127.0.0.1:8080`，由同机 Nginx 转发。

## 数据库连接与初始化

1. ECS 和 RDS 选择同地域、同 VPC，配置 RDS 对 ECS 的访问白名单。
2. 在 RDS 创建 `dongxiang_culture` 数据库，字符集使用 `utf8mb4`。
3. 使用初始化账号，在该数据库执行项目里的 `backend/src/main/resources/db/init/schema.sql`。
4. 创建应用账号。当前功能只有读取，可以先授予该库的读取权限；后续开发写入功能时再调整。
5. 将实际连接信息填写到服务器 `/etc/dongxiang/backend.env`。该文件由 root 管理，例如权限 `600`；systemd 读取后再以应用用户运行 Java。

`cloud` 配置关闭自动执行建表与样例数据脚本。它不会向 RDS 自动加入本地学习文章，正式内容由负责人核对后再导入。

`backend.env.example` 使用 systemd 环境文件格式，不作为 shell 脚本执行。部署前需要把所有 `REPLACE_...` 值换成真实配置。

## 构建产物

以下命令在开发电脑上的项目根目录执行。后端可以直接构建，不需要为构建连接数据库：

```bash
cd backend
MAVEN_USER_HOME=../.runtime/maven-home ./mvnw -B -ntp -Dmaven.repo.local=../.runtime/m2 -DskipTests package
```

生成 `backend/target/culture-platform-0.0.1-SNAPSHOT.jar`，上传后按约定命名为 `culture-platform.jar`。`-DskipTests` 仅用于打包；集成测试另按项目 README 执行。

前端在 `frontend/` 执行 `npm run build`，将生成的 `dist/` 内容上传至 `/opt/dongxiang/frontend/`。

## 启动前需要落实的配置

在 ECS 创建 `dongxiang` 用户并配置应用文件的所有权；Nginx 需要能读取前端目录。按实际域名修改 Nginx 模板中的 `culture.example.com`，安装对应证书，并检查系统中其他站点配置与端口占用。

准备完成后，在 ECS 先执行 `nginx -t` 和 `systemd-analyze verify /etc/systemd/system/dongxiang.service`，再加载配置并启动 Java。用 `curl http://127.0.0.1:8080/api/articles` 检查真实数据库访问，然后通过域名检查首页、文章详情与 `/api/articles`。

Java 日志通过 `journalctl -u dongxiang` 查看；备份保留与恢复、域名和实际上线要求在云端开通时逐项落实。

## 后续共同实现的顺序

1. 确定云资源的地域、规格和实际费用，开通 ECS 与 RDS。
2. 从 ECS 连通 RDS，手动建表并验证一条查询。
3. 启动 Java，验证文章接口。
4. 配置 Nginx、前端文件和 HTTPS，验证手机访问。
5. 增加业务模块，并逐步加入账号、审核和运维能力。

具体采购价格、规格和费用上限需要在购买前明确。本目录不执行购买、创建云资源或远程部署。

## 参考

- [阿里云创建 RDS MySQL](https://help.aliyun.com/zh/rds/apsaradb-rds-for-mysql/create-an-apsaradb-rds-for-mysql-instance-1)
- [Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)
- [Spring Boot 外部配置](https://docs.spring.io/spring-boot/reference/features/external-config.html)
- [Spring Boot 数据库初始化](https://docs.spring.io/spring-boot/how-to/data-initialization.html)
