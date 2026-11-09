/** 与 Java 文章读取接口返回的 JSON 字段保持一致。 */
export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
  sourceName: string;
  sourceUrl: string;
};
