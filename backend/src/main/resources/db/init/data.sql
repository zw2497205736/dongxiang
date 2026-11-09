-- 学习样例：依据国家民委《概况》整理，正式公开前由项目负责人核对。
-- 仅在文章不存在时加入样例，避免重启覆盖学习时手动修改的数据。
INSERT INTO culture_article (slug, title, summary, body, source_name, source_url)
SELECT
    'getting-to-know-dongxiang',
    '认识东乡族：从故乡与语言开始',
    '从聚居的土地，到家人熟悉的语言，用一篇短文开启对东乡族文化的了解。',
    CONCAT(
        '东乡族主要聚居在甘肃省临夏回族自治州，东乡族自治县是其中的集中聚居地。', CHAR(10), CHAR(10),
        '东乡族聚居地区位于青藏高原与黄土高原的过渡地带，既有河谷川塬，也有浅山丘陵。', CHAR(10), CHAR(10),
        '国家民委的资料介绍了锁南、汪家集、四甲集等东乡语土语。认识地域与语言之间的联系，可以成为了解东乡族文化的起点。'
    ),
    '国家民族事务委员会 · 东乡族《概况》',
    'https://www.neac.gov.cn/seac/ztzl/dxz/gk.shtml'
WHERE NOT EXISTS (
    SELECT 1 FROM culture_article WHERE slug = 'getting-to-know-dongxiang'
);
