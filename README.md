# 东乡文化平台

项目仓库：[zw2497205736/dongxiang](https://github.com/zw2497205736/dongxiang)。

这是我们共同实现的第一个学习里程碑：**一篇文化文章从 MySQL，经 Java 接口，显示到手机网页。**

当前可用的是文化文章列表、详情、资料来源入口和分享链接。语言学习、歌曲、后台编辑、登录与用户投稿按后续里程碑实现。

这份代码是本地学习版本。示例文章依据[国家民委《东乡族·概况》](https://www.neac.gov.cn/seac/ztzl/dxz/gk.shtml)整理；公开发布前需要负责人完成内容核对与素材使用确认。微信真机、实际外部分享和公网部署尚未验证。

云端目标已确定为 **ECS + Nginx + Spring Boot + 独立 RDS MySQL**。配置模板与分步说明见 [阿里云部署目录](deploy/aliyun/README.md)，决策依据见 [架构决策 0001](docs/decisions/0001-system-architecture.md)。云端使用 `cloud` 配置，关闭自动建表与学习样例导入。

## 从这里开始

在新环境获取代码：

```bash
git clone https://github.com/zw2497205736/dongxiang.git dongxiang-platform
cd dongxiang-platform
```

先读 [项目架构与目录说明](docs/ARCHITECTURE.md) 找到代码位置，再按 [第一课：一篇文章怎样到达页面](docs/01-article-data-flow.md) 跟一遍数据流。

已验证的开发环境为 Java 25、Node.js 24、MySQL 8.4。Java 代码以 Java 17 为编译目标。Maven Wrapper 随项目提供，无须额外安装 Maven。当前本地数据库脚本适配 Apple Silicon Mac 上的 Homebrew MySQL，其他环境可手动设置数据库连接。

在项目根目录执行：

```bash
./scripts/dev.sh
```

打开 **http://127.0.0.1:5173**。首次启动可能需要联网下载依赖。按 `Ctrl+C` 停止前后端；数据库单独停止：

```bash
./scripts/mysql.sh stop
```

这两个地址都只供当前电脑使用。手机和微信不能通过自己的 `127.0.0.1` 访问这台电脑；真机联调将在后续步骤单独配置。

## 看懂项目结构

```text
backend/
  src/main/resources/db/init/          建表与样例数据
  src/main/java/.../article/
    api/ArticleController.java         接收请求并返回 JSON
    model/Article.java                 一篇文章有哪些字段
    repository/ArticleRepository.java  用 SQL 读取数据库
frontend/
  src/app/                            应用入口、地址匹配与全站布局
  src/pages/                          首页、文章详情与无效页面提示
  src/features/articles/              文章接口、类型与文章卡片
  src/shared/                         公共请求、Hook、UI 与样式
scripts/                               本地启动与数据库命令
deploy/aliyun/                         ECS、Nginx、Java 服务与 RDS 配置模板
docs/                                  已确认的项目范围与学习材料
.runtime/                              本地数据库、日志、依赖缓存，已忽略
.env                                   本地随机生成的数据库凭据，已忽略
.env.example                           不含实际密码的开发配置示例
```

## 分开启动与验证

```bash
# 1. 启动项目独立 MySQL，127.0.0.1:3307
./scripts/mysql.sh start

# 2. 启动后端，127.0.0.1:8080
./scripts/backend.sh

# 3. 另开终端启动前端，127.0.0.1:5173
cd frontend
npm ci --cache ../.runtime/npm-cache
npm run dev
```

在项目根目录测试后端：

```bash
./scripts/mysql.sh start
./scripts/backend.sh clean verify
```

测试连接真实 MySQL，通过实际 HTTP 请求检查中文及 emoji 的读取、资料来源字段、文章列表和 404。测试只删除自己创建的随机测试条目。

构建前端：

```bash
cd frontend
npm run build
```

查看接口：

```bash
curl http://127.0.0.1:8080/api/articles
curl http://127.0.0.1:8080/api/articles/getting-to-know-dongxiang
```

进入项目数据库：

```bash
./scripts/mysql.sh sql
```

进入后先运行一条查询：

```sql
SELECT slug, title, source_name FROM culture_article;
```

## 本地环境的约定

- MySQL 使用项目内 `.runtime/mysql-data`，端口为 3307；没有启用开机启动。
- `scripts/mysql.sh` 默认使用 `/opt/homebrew/opt/mysql@8.4/bin`。其他安装位置可以设置 `MYSQL_BIN` 后运行。
- 数据库密码随机生成，脚本通过本地配置文件读取。请保留 `.env` 和 `.runtime/mysql-root.cnf`，不要提交或分享它们。
- 后端从 `.env` 读取数据库连接，前端没有数据库凭据。
- `schema.sql` 只在表不存在时创建表；`data.sql` 只在样例文章不存在时插入。重启不会覆盖你改过的文章。
- 修改表结构时，需对已有数据库执行 `ALTER TABLE`。仅修改 `CREATE TABLE IF NOT EXISTS` 不会更新已有表。
- 日志在 `.runtime/backend.log`、`.runtime/mysql.log`；停服不会删除数据。
- 当前只提供读取接口。管理后台、写入接口及其认证将在后续开发，正式部署配置届时单独完成。

## 参考文档

- [Spring Boot 3.5 系统要求](https://docs.spring.io/spring-boot/3.5/system-requirements.html)
- [Spring JDBC / JdbcClient](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html)
- [Vite 入门](https://vite.dev/guide/)
- [MySQL 初始化数据目录](https://dev.mysql.com/doc/refman/8.4/en/data-directory-initialization.html)
