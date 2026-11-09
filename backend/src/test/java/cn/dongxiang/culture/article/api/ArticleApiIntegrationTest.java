package cn.dongxiang.culture.article.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.simple.JdbcClient;

/** 用真实 MySQL 和真实 HTTP 验证整条读取链路；只清理本测试创建的行。 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ArticleApiIntegrationTest {
    @LocalServerPort
    private int port;
    @Autowired
    private JdbcClient jdbc;
    @Autowired
    private ObjectMapper json;

    private final HttpClient http = HttpClient.newHttpClient();
    private String slug;

    @BeforeEach
    void insertFixture() {
        slug = "test-" + UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO culture_article (slug, title, summary, body, source_name, source_url)
                VALUES (:slug, :title, :summary, :body, :sourceName, :sourceUrl)
                """)
                .param("slug", slug)
                .param("title", "中文读写测试 🏔️")
                .param("summary", "验证中文与 emoji 能从数据库传到接口")
                .param("body", "第一段。\n\n第二段。")
                .param("sourceName", "测试资料来源")
                .param("sourceUrl", "https://example.com/test-source")
                .update();
    }

    @AfterEach
    void removeFixture() {
        jdbc.sql("DELETE FROM culture_article WHERE slug = :slug").param("slug", slug).update();
    }

    @Test
    void readsUnicodeAndSourceFromMysqlThroughHttp() throws Exception {
        HttpResponse<String> response = get("/api/articles/" + slug);
        assertThat(response.statusCode()).isEqualTo(200);
        JsonNode article = json.readTree(response.body());
        assertThat(article.get("title").asText()).isEqualTo("中文读写测试 🏔️");
        assertThat(article.get("body").asText()).isEqualTo("第一段。\n\n第二段。");
        assertThat(article.get("sourceName").asText()).isEqualTo("测试资料来源");
        assertThat(article.get("sourceUrl").asText()).isEqualTo("https://example.com/test-source");
    }

    @Test
    void listsTheDatabaseArticle() throws Exception {
        HttpResponse<String> response = get("/api/articles");
        assertThat(response.statusCode()).isEqualTo(200);
        boolean found = false;
        for (JsonNode article : json.readTree(response.body())) {
            if (article.get("slug").asText().equals(slug)) {
                found = true;
            }
        }
        assertThat(found).isTrue();
    }

    @Test
    void missingArticleReturns404() throws Exception {
        HttpResponse<String> response = get("/api/articles/missing-" + UUID.randomUUID());
        assertThat(response.statusCode()).isEqualTo(404);
    }

    private HttpResponse<String> get(String path) throws Exception {
        return http.send(
                HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }
}
