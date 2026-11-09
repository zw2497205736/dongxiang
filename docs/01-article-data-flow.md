# 第一课：一篇文章怎样到达页面

这一课只抓住一件事：**页面上的文章，来自数据库里的一行数据。**

先别急着记住全部注解和工具。用下面五步观察同一篇文章经过了什么地方。

## 1. MySQL：数据存放在哪里

打开 `backend/src/main/resources/db/init/schema.sql`。`culture_article` 是一张表，每一行代表一篇文章，每一列代表一个属性。

| 数据库列 | Java / JSON / TypeScript 字段 | 用途 |
| --- | --- | --- |
| `slug` | `slug` | 文章的链接标识，例如 `getting-to-know-dongxiang` |
| `title` | `title` | 标题 |
| `summary` | `summary` | 简介 |
| `body` | `body` | 正文，段落用空行分隔 |
| `source_name` | `sourceName` | 资料来源名称 |
| `source_url` | `sourceUrl` | 原始资料链接 |

`id` 是数据库内部编号；`slug` 用于对外链接。标题变化时，保持 `slug` 不变可以保留原链接。

先启动数据库和后端，再执行：

```bash
./scripts/mysql.sh sql
```

```sql
SELECT slug, title, source_name FROM culture_article;
```

这一步绕开网页，直接确认数据是否存在。

## 2. Repository：Java 怎样取到这一行

打开后端 `article/repository/ArticleRepository.java`，找到 `findBySlug`。它执行一条带绑定参数的 SQL，`JdbcClient` 负责连接、执行查询和读取结果。

`article/model/Article.java` 定义结果的字段。SQL 列名 `source_name` 会映射到 Java 字段 `sourceName`。

先回答：如果数据库查询不到这篇文章，`Optional<Article>` 表示什么？

## 3. Controller：浏览器向谁要数据

打开后端 `article/api/ArticleController.java`，找到 `@GetMapping("/{slug}")`。

浏览器请求 `/api/articles/getting-to-know-dongxiang`，Spring 把链接里的最后一段传给 `slug` 参数，Controller 调用 Repository，最后把 `Article` 转为 JSON 返回。

后端启动后执行：

```bash
curl http://127.0.0.1:8080/api/articles/getting-to-know-dongxiang
```

观察：JSON 的 `title` 是否与刚才 SQL 查询的结果相同？

不存在的链接应返回 404，而不是成功返回一个空对象。

## 4. React：数据怎样变成页面

先打开 `frontend/src/pages/ArticlePage.tsx`，观察详情页怎样加载并展示文章；再看 `frontend/src/features/articles/api/articles.ts`，找到文章接口地址。

公共请求函数 `frontend/src/shared/api/http.ts` 中的 `fetchJson` 向 `/api/...` 发请求。开发时 Vite 将请求转给 8080 端口的 Java 后端。`shared/hooks/useRequest.ts` 管理加载状态，React 拿到 JSON 后把 `article.title`、`article.body` 等字段放进页面。

页面有加载中、成功、失败三种状态。前端不会直接连接 MySQL，也不需要知道数据库密码。

## 5. 你先亲手做的练习

启动项目，先打开文章详情。然后进入 MySQL，将标题改成你自己的一句话：

```sql
UPDATE culture_article
SET title = '我开始重新认识东乡族'
WHERE slug = 'getting-to-know-dongxiang';
```

刷新详情页和首页，再请求一次接口。

请用观察结果回答：

1. 为什么修改数据库后，不需要改 React 代码，页面标题就变了？
2. 为什么修改标题没有让文章链接失效？
3. 刷新页面时，是前端、Java 还是 MySQL 先收到请求？

这次只修改标题。完成后，再一起练习新增字段，把一次修改贯穿数据库、Java 与前端。

## 下一次一起做的练习：新增“资料备注”

目标是在原始来源下面显示补充说明，例如“该资料页面中的部分统计数据来自不同年份，使用时需分别核对”。

先自己思考修改会经过哪些地方，不急着一次改完：

1. 已有 MySQL 表怎样加上 `source_note` 列？
2. 后端的字段和查询怎样带上它？
3. 前端怎样接收并显示 `sourceNote`？
4. 备注为空时，页面应该显示什么？

我们会在你完成标题练习后，共同实现这一小块。
