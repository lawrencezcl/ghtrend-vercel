#!/usr/bin/env node

// 设置环境变量
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_w9QEDSlLkyT3@ep-jolly-hill-adhlaq48-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
process.env.NODE_ENV = "development";

const { initDatabase } = require('./init-database');

async function runLocalCron() {
  console.log('🚀 启动本地cron job...');
  console.log('==========================');
  
  try {
    // 1. 初始化数据库
    console.log('📝 步骤1: 初始化数据库...');
    await initDatabase();
    
    // 2. 模拟抓取trending数据
    console.log('\n📊 步骤2: 模拟抓取GitHub Trending...');
    await simulateFetchTrending();
    
    // 3. 模拟生成文章
    console.log('\n✍️ 步骤3: 模拟生成文章...');
    await simulateGenerateArticles();
    
    console.log('\n🎉 本地cron job执行完成！');
    console.log('💡 现在可以启动本地服务器进行测试');
    
  } catch (error) {
    console.error('❌ Cron job执行失败:', error.message);
    process.exit(1);
  }
}

async function simulateFetchTrending() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    // 添加更多示例仓库
    const repos = [
      {
        id: 'vercel/next.js',
        lang: 'JavaScript',
        stars_total: 122345,
        stars_7d: 789,
        topics: JSON.stringify(['nextjs', 'react', 'framework']),
        readme_excerpt: 'The React Framework for the Web',
        homepage: 'https://nextjs.org',
        license: 'MIT',
        owner_type: 'organization'
      },
      {
        id: 'openai/whisper',
        lang: 'Python',
        stars_total: 65432,
        stars_7d: 1234,
        topics: JSON.stringify(['ai', 'speech-recognition', 'machine-learning']),
        readme_excerpt: 'Robust Speech Recognition via Large-Scale Weak Supervision',
        homepage: 'https://openai.com/research/whisper',
        license: 'MIT',
        owner_type: 'organization'
      },
      {
        id: 'supabase/supabase',
        lang: 'TypeScript',
        stars_total: 67890,
        stars_7d: 567,
        topics: JSON.stringify(['database', 'postgresql', 'realtime']),
        readme_excerpt: 'The open source Firebase alternative',
        homepage: 'https://supabase.com',
        license: 'Apache-2.0',
        owner_type: 'organization'
      },
      {
        id: 'tauri-apps/tauri',
        lang: 'Rust',
        stars_total: 78901,
        stars_7d: 890,
        topics: JSON.stringify(['desktop', 'rust', 'cross-platform']),
        readme_excerpt: 'Build smaller, faster, and more secure desktop applications',
        homepage: 'https://tauri.app',
        license: 'Apache-2.0',
        owner_type: 'organization'
      }
    ];
    
    for (const repo of repos) {
      await client.query(`
        INSERT INTO repos (id, lang, stars_total, stars_7d, topics, readme_excerpt, homepage, license, owner_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          stars_total = $3,
          stars_7d = $4,
          topics = $5,
          readme_excerpt = $6,
          homepage = $7,
          license = $8,
          owner_type = $9
      `, [repo.id, repo.lang, repo.stars_total, repo.stars_7d, repo.topics, repo.readme_excerpt, repo.homepage, repo.license, repo.owner_type]);
    }
    
    console.log(`✅ 添加了 ${repos.length} 个trending仓库`);
    
  } finally {
    client.release();
    await pool.end();
  }
}

async function simulateGenerateArticles() {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    // 生成更多示例文章
    const articles = [
      {
        id: 'article-3',
        repo_id: 'vercel/next.js',
        title_cn: 'Next.js：全栈React开发框架',
        title_en: 'Next.js: The React Framework for Production',
        summary_cn: 'Next.js提供了生产级React应用所需的所有功能，包括SSR、SSG、API路由等。',
        summary_en: 'Next.js gives you the best developer experience with all the features you need for production.',
        body_cn_md: `# Next.js：全栈React开发框架

Next.js是由Vercel开发的React框架，为生产环境提供了最佳的开发体验。

## 核心特性

### 服务端渲染 (SSR)
Next.js支持服务端渲染，提升首屏加载速度和SEO：

\`\`\`jsx
export async function getServerSideProps(context) {
  const data = await fetchData();
  return {
    props: { data }
  };
}
\`\`\`

### 静态站点生成 (SSG)
构建时预生成页面，获得最佳性能：

\`\`\`jsx
export async function getStaticProps() {
  const posts = await getPosts();
  return {
    props: { posts },
    revalidate: 60 // ISR
  };
}
\`\`\`

### API路由
内置API路由，轻松构建全栈应用：

\`\`\`jsx
// pages/api/users.js
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' });
}
\`\`\`

## 为什么选择Next.js？

1. **零配置**：开箱即用，无需复杂配置
2. **自动优化**：代码分割、图片优化等
3. **灵活部署**：支持静态导出、服务器部署
4. **丰富生态**：大量插件和工具支持

Next.js已成为React应用开发的首选框架。`,
        body_en_md: 'Next.js: The React Framework for Production...',
        status: 'published'
      },
      {
        id: 'article-4',
        repo_id: 'openai/whisper',
        title_cn: 'Whisper：OpenAI的语音识别革命',
        title_en: 'Whisper: OpenAI Speech Recognition Revolution',
        summary_cn: 'Whisper是OpenAI开源的语音识别系统，在多语言和噪音环境下表现出色。',
        summary_en: 'Whisper is OpenAI open-source speech recognition system with excellent multilingual performance.',
        body_cn_md: `# Whisper：OpenAI的语音识别革命

Whisper是OpenAI开发的自动语音识别系统，通过大规模弱监督学习训练而成。

## 技术亮点

### 多语言支持
Whisper支持99种语言的识别和翻译：

\`\`\`python
import whisper

model = whisper.load_model("base")
result = model.transcribe("audio.mp3")
print(result["text"])
\`\`\`

### 鲁棒性强
在噪音环境和各种口音下都有良好表现：

- 背景噪音处理
- 方言和口音适应
- 技术术语识别
- 音乐和特效过滤

### 多种模型规模
根据需求选择不同大小的模型：

| 模型 | 参数量 | 英语准确率 | 速度 |
|------|--------|------------|------|
| tiny | 39M | ~32% | ~32x |
| base | 74M | ~34% | ~16x |
| small | 244M | ~35% | ~6x |
| medium | 769M | ~36% | ~2x |
| large | 1550M | ~37% | 1x |

## 应用场景

1. **会议记录**：自动转录会议内容
2. **内容创作**：视频字幕生成
3. **语言学习**：发音评估和纠正
4. **无障碍访问**：为听障人群提供字幕

Whisper开启了语音识别技术的新时代。`,
        body_en_md: 'Whisper: OpenAI Speech Recognition Revolution...',
        status: 'published'
      },
      {
        id: 'article-5',
        repo_id: 'supabase/supabase',
        title_cn: 'Supabase：开源的Firebase替代方案',
        title_en: 'Supabase: The Open Source Firebase Alternative',
        summary_cn: 'Supabase提供了开源的后端即服务解决方案，包括数据库、认证、实时订阅等功能。',
        summary_en: 'Supabase provides open source Backend-as-a-Service with database, auth, and realtime subscriptions.',
        body_cn_md: `# Supabase：开源的Firebase替代方案

Supabase是开源的Firebase替代品，基于PostgreSQL构建，提供完整的后端服务。

## 核心服务

### PostgreSQL数据库
使用世界上最先进的开源数据库：

\`\`\`sql
-- 创建表
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 行级安全策略
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
\`\`\`

### 实时订阅
监听数据库变化，实现实时功能：

\`\`\`javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

// 监听数据变化
supabase
  .channel('posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'posts'
  }, payload => {
    console.log('新文章:', payload);
  })
  .subscribe();
\`\`\`

### 用户认证
内置多种认证方式：

\`\`\`javascript
// 邮箱注册
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// 第三方登录
const { user, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});
\`\`\`

### 边缘函数
部署Serverless函数：

\`\`\`typescript
// supabase/functions/hello/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  return new Response(
    JSON.stringify({ message: "Hello World!" }),
    { headers: { "Content-Type": "application/json" } }
  );
});
\`\`\`

## 优势特点

1. **开源透明**：完全开源，可自托管
2. **SQL原生**：基于PostgreSQL，支持复杂查询
3. **实时能力**：内置WebSocket支持
4. **类型安全**：自动生成TypeScript类型
5. **扩展性强**：支持PostgreSQL扩展

Supabase让开发者能够快速构建现代应用。`,
        body_en_md: 'Supabase: The Open Source Firebase Alternative...',
        status: 'published'
      }
    ];
    
    for (const article of articles) {
      await client.query(`
        INSERT INTO articles (id, repo_id, title_cn, title_en, summary_cn, summary_en, body_cn_md, body_en_md, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          title_cn = $3,
          title_en = $4,
          summary_cn = $5,
          summary_en = $6,
          body_cn_md = $7,
          body_en_md = $8,
          status = $9
      `, [article.id, article.repo_id, article.title_cn, article.title_en, article.summary_cn, article.summary_en, article.body_cn_md, article.body_en_md, article.status]);
    }
    
    console.log(`✅ 生成了 ${articles.length} 篇新文章`);
    
    // 创建精选记录
    for (let i = 0; i < articles.length; i++) {
      await client.query(`
        INSERT INTO picks (id, repo_id, score, reason, date)
        VALUES ($1, $2, $3, $4, CURRENT_DATE)
        ON CONFLICT (id) DO NOTHING
      `, [`pick-${i + 3}`, articles[i].repo_id, 90 - i * 2, `优秀的${articles[i].repo_id.split('/')[1]}项目`]);
    }
    
    console.log('✅ 创建了对应的精选记录');
    
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行脚本
if (require.main === module) {
  runLocalCron();
}

module.exports = { runLocalCron };