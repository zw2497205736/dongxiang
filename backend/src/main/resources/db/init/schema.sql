-- 初始化文章表。IF NOT EXISTS 保留已有数据；后续改表需单独执行变更 SQL。
CREATE TABLE IF NOT EXISTS culture_article (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    source_name VARCHAR(200) NOT NULL,
    source_url VARCHAR(600) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
