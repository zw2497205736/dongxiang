package cn.dongxiang.culture.article.repository;

import cn.dongxiang.culture.article.model.Article;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class ArticleRepository {
    private static final String COLUMNS = "slug, title, summary, body, source_name, source_url";
    private final JdbcClient jdbc;

    public ArticleRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Article> findAll() {
        return jdbc.sql("SELECT " + COLUMNS + " FROM culture_article ORDER BY id")
                .query(Article.class)
                .list();
    }

    public Optional<Article> findBySlug(String slug) {
        // :slug 是绑定参数，访问者输入不会被拼进 SQL 语句。
        return jdbc.sql("SELECT " + COLUMNS + " FROM culture_article WHERE slug = :slug")
                .param("slug", slug)
                .query(Article.class)
                .optional();
    }
}
