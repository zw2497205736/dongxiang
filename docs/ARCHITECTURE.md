# 项目架构与目录说明

项目根目录是 `dongxiang-platform/`。`backend/` 是 Java 后端，`frontend/` 是 React 前端，`scripts/` 放运行命令，`docs/` 放项目共识与学习说明。

后端先按业务分组，业务内部再按职责分组。前端按应用入口、页面、业务功能与公共代码组织。

## 整个系统怎样运行

[打开 2026-11-09 系统架构快照](architecture/system-overview-2026-11-09.html)。上方是生成时已实现的本地连接，下方是尚未部署的云端方案；当前实现与决策以本文档和代码为准。

当前开发环境：浏览器中的 React → Vite（5173，转发 `/api`）→ Spring Boot（8080）→ 本地 MySQL（3307）。这些地址均绑定本机回环地址。

云端目标：微信或手机浏览器 → 域名与 HTTPS → ECS 上的 Nginx。Nginx 提供 React 构建出的静态文件，并把 `/api` 请求转交给同一 ECS 上的 Java 应用；Java 使用连接池和 JDBC 访问独立 RDS MySQL 的内网地址。ECS 与 RDS 选择同地域、同 VPC，配置相应数据库访问白名单。独立 RDS 方案与采购预算仍待确认。

| 位置 | 职责与连接 |
| --- | --- |
| 用户浏览器 | 运行 React，通过 HTTP / JSON 获取业务数据 |
| ECS 应用服务器 | 运行 Nginx 与 Java；提供构建好的网页文件 |
| Nginx | 提供静态文件、处理 HTTPS、转发 `/api` |
| Spring Boot | 处理业务、权限和数据库访问；目前只实现文章读取 |
| MySQL / RDS | 保存文章等结构化业务数据；由后端连接 |
| 对象存储，后续可选 | 保存授权图片和音频，数据库保存它们的元数据与引用 |

数据库连接的后端配置入口是 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`；这些值不交给前端。当前使用 MySQL JDBC 驱动与 HikariCP 连接池。连接池负责复用数据库连接，HTTP 请求按需借用连接执行 SQL。

Redis、向量检索、消息队列和独立 Worker 尚未接入。分别在出现共享缓存或状态、可信资料检索、耗时任务与独立扩容需求时选择。增加这些基础设施时，需要同步明确数据归属、任务持久化、重试与监控。

系统架构方向已确认，决策见 [0001](decisions/0001-system-architecture.md)。`deploy/aliyun/` 已提供 Nginx、systemd 和 RDS 连接模板，后端新增 `cloud` 配置；实际云资源、域名、证书和远程部署尚未完成。日志监控、备份恢复与后续设施在对应阶段落实。

## 目录总览

```text
dongxiang-platform/
├── backend/
│   ├── pom.xml                          Maven 依赖与打包配置
│   ├── mvnw / mvnw.cmd                  Maven 启动入口
│   └── src/
│       ├── main/
│       │   ├── java/cn/dongxiang/culture/
│       │   │   ├── CultureApplication.java
│       │   │   └── article/              文化文章业务
│       │   │       ├── api/
│       │   │       │   └── ArticleController.java
│       │   │       ├── model/
│       │   │       │   └── Article.java
│       │   │       └── repository/
│       │   │           └── ArticleRepository.java
│       │   └── resources/
│       │       ├── application.yml       运行配置
│       │       ├── application-cloud.yml 云端运行配置
│       │       └── db/init/
│       │           ├── schema.sql        初始化表结构
│       │           └── data.sql          初始化样例文章
│       └── test/java/cn/dongxiang/culture/article/api/
│           └── ArticleApiIntegrationTest.java
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts                   前端开发服务与 /api 代理
│   └── src/
│       ├── main.tsx                     挂载 React，加载全局样式
│       ├── app/
│       │   ├── App.tsx                  选择页面
│       │   ├── routes.ts                地址与页面的对应关系
│       │   └── SiteLayout.tsx           全站页头、正文区域和页脚
│       ├── pages/
│       │   ├── HomePage.tsx             首页、文章列表
│       │   ├── ArticlePage.tsx          文章详情
│       │   └── NotFoundPage.tsx         无效页面地址
│       ├── features/articles/
│       │   ├── api/articles.ts          文章列表、详情请求
│       │   ├── model/article.ts         前端文章数据类型
│       │   └── components/ArticleCard.tsx
│       └── shared/
│           ├── api/http.ts              通用 HTTP 与 JSON 处理
│           ├── hooks/useRequest.ts      请求状态与取消
│           ├── styles/global.css       当前统一样式表
│           └── ui/
│               ├── Landscape.tsx       山川插画
│               ├── ShareLinkButton.tsx 复制链接
│               └── RequestError.tsx    错误提示与恢复入口
├── scripts/
│   ├── dev.sh                           启动本地前后端验证环境
│   ├── backend.sh                       启动、构建或测试后端
│   └── mysql.sh                         管理现有本地测试数据库
├── deploy/aliyun/                       ECS 运行与 RDS 连接模板
├── docs/
├── .env                                 本地凭据，已忽略
└── .runtime/                            测试数据、日志、缓存，已忽略
```

`backend/target/`、`frontend/node_modules/`、`frontend/dist/` 是生成内容。阅读业务代码时可以先折叠它们。IDE 的 `.idea/` 是编辑器配置。

## 一次请求经过哪些位置

以打开文章详情为例：

```text
/culture/getting-to-know-dongxiang
  → app/routes.ts 判断为文章详情
  → pages/ArticlePage.tsx 组织页面并加载数据
  → features/articles/api/articles.ts 确定文章接口地址
  → shared/api/http.ts 使用 fetch 发出 HTTP 请求
  → Vite 开发代理转交给 Java
  → article/api/ArticleController 接收请求
  → article/repository/ArticleRepository 查询 MySQL
  → article/model/Article 承载结果，Spring 返回 JSON
  → shared/hooks/useRequest.ts 更新请求状态
  → ArticlePage 显示正文、来源和分享入口
```

`ArticlePage` 处理文章特有的 404 提示；公共请求代码处理 HTTP 状态、JSON 解析、请求取消和网络错误。

当前通过普通链接切换页面，浏览器打开新页面时再选择对应页面。`routes.ts` 是当前两个有效页面的简单地址匹配，不是完整的客户端路由框架。

## 想改什么，去哪里找

| 任务 | 主要位置 |
| --- | --- |
| 修改首页介绍文字 | `frontend/src/pages/HomePage.tsx` |
| 调整文章详情排版 | `frontend/src/pages/ArticlePage.tsx` |
| 修改页头或页脚 | `frontend/src/app/SiteLayout.tsx` |
| 修改文章卡片 | `frontend/src/features/articles/components/ArticleCard.tsx` |
| 修改文章请求地址 | `frontend/src/features/articles/api/articles.ts` |
| 修改所有请求的基础处理 | `frontend/src/shared/api/http.ts` |
| 修改查询条件或排序 | `backend/.../article/repository/ArticleRepository.java` |
| 新增或修改 HTTP 入口 | `backend/.../article/api/ArticleController.java` |
| 修改文章字段 | 数据表、Java `model/Article.java`、查询、前端 `model/article.ts` 与使用该字段的页面 |
| 修改数据库连接与端口 | 后端 `application.yml` 和运行环境变量 |

## 目录之间的关系

前端的 `app` 选择并组合 `pages`；页面调用 `features` 中的业务能力，复用 `shared` 中的公共代码。公共 HTTP 与 UI 代码不反向依赖具体业务或页面。

后端的 `api` 处理 HTTP 请求，`repository` 处理 SQL 查询，`model` 定义文章数据。当前业务只有读取，Controller 直接调用 Repository。出现审核、发布条件等业务规则时，再在 `article` 下增加负责这些规则的 `service`；届时让 Controller 调用它。

`Article` 当前同时承接数据库查询结果与接口返回数据。将来如果出现内部字段与对外字段不同的需求，再分别定义内部模型和响应模型。

以后实现语言、歌曲时，在后端业务包、前端 `features` 与相应页面下扩展。当前只创建实际使用的目录。

## 本次整理的范围

本次整理代码职责、Java 包名、导入关系和 SQL 资源路径。对外仍使用 `/api/articles`、`/api/articles/{slug}`，JSON 字段与页面地址保持一致。

云端架构方向已确认；ECS 与数据库的具体采购规格和费用仍待明确。本地脚本用于代码验证，云端模板尚未应用到服务器。
