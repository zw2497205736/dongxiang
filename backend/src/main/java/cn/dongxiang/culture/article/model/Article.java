package cn.dongxiang.culture.article.model;

/** 一篇文章在接口中的数据形状；字段名会成为 JSON 的属性名。 */
public record Article(
        String slug,
        String title,
        String summary,
        String body,
        String sourceName,
        String sourceUrl
) {
}
