-- GitHub Trending Auto-Publisher Database Schema

-- 存储GitHub仓库信息
CREATE TABLE IF NOT EXISTS repos (
    id TEXT PRIMARY KEY,
    lang TEXT,
    stars_total INTEGER DEFAULT 0,
    stars_7d INTEGER DEFAULT 0,
    topics JSONB DEFAULT '[]'::jsonb,
    readme_excerpt TEXT,
    homepage TEXT,
    license TEXT,
    owner_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储每日精选的项目
CREATE TABLE IF NOT EXISTS picks (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL REFERENCES repos(id),
    score DOUBLE PRECISION NOT NULL,
    reason TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储生成的文章
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    repo_id TEXT NOT NULL REFERENCES repos(id),
    title_cn TEXT,
    title_en TEXT,
    summary_cn TEXT,
    summary_en TEXT,
    body_cn_md TEXT,
    body_en_md TEXT,
    assets JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'draft',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储发布记录
CREATE TABLE IF NOT EXISTS publishes (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL REFERENCES articles(id),
    platform TEXT NOT NULL,
    post_url TEXT,
    post_id TEXT,
    status TEXT DEFAULT 'queued',
    retries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 存储发布指标
CREATE TABLE IF NOT EXISTS metrics (
    id BIGSERIAL PRIMARY KEY,
    publish_id TEXT NOT NULL REFERENCES publishes(id),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_picks_date ON picks(date DESC);
CREATE INDEX IF NOT EXISTS idx_repos_lang ON repos(lang);
CREATE INDEX IF NOT EXISTS idx_repos_stars ON repos(stars_total DESC);
