package cn.dongxiang.culture.article.api;

import cn.dongxiang.culture.article.model.Article;
import cn.dongxiang.culture.article.repository.ArticleRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    private final ArticleRepository articles;

    public ArticleController(ArticleRepository articles) {
        this.articles = articles;
    }

    @GetMapping
    public List<Article> list() {
        return articles.findAll();
    }

    @GetMapping("/{slug}")
    public Article detail(@PathVariable String slug) {
        return articles.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));
    }
}
