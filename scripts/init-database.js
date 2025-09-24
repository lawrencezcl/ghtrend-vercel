#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 从环境变量或.env.example获取数据库URL
const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://neondb_owner:npg_w9QEDSlLkyT3@ep-jolly-hill-adhlaq48-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function initDatabase() {
  console.log('🗄️ 开始初始化数据库...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // 测试连接
    console.log('📡 测试数据库连接...');
    const client = await pool.connect();
    console.log('✅ 数据库连接成功！');
    
    // 读取SQL文件
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 执行数据库schema...');
    // 先删除现有表
    await client.query('DROP TABLE IF EXISTS metrics CASCADE');
    await client.query('DROP TABLE IF EXISTS publishes CASCADE');
    await client.query('DROP TABLE IF EXISTS articles CASCADE');
    await client.query('DROP TABLE IF EXISTS picks CASCADE');
    await client.query('DROP TABLE IF EXISTS repos CASCADE');
    
    // 创建新表
    await client.query(schema);
    console.log('✅ 数据库表创建成功！');
    
    // 插入一些示例数据
    console.log('🌱 插入示例数据...');
    
    // 示例仓库数据
    await client.query(`
      INSERT INTO repos (id, lang, stars_total, stars_7d, topics, readme_excerpt, homepage, license, owner_type) 
      VALUES 
        ('microsoft/typescript', 'TypeScript', 98123, 234, '["typescript", "javascript", "compiler"]'::jsonb, 'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.', 'https://www.typescriptlang.org', 'Apache-2.0', 'organization'),
        ('facebook/react', 'JavaScript', 225489, 456, '["react", "javascript", "library"]'::jsonb, 'A declarative, efficient, and flexible JavaScript library for building user interfaces.', 'https://reactjs.org', 'MIT', 'organization'),
        ('vercel/next.js', 'JavaScript', 122345, 789, '["nextjs", "react", "framework"]'::jsonb, 'The React Framework for the Web', 'https://nextjs.org', 'MIT', 'organization')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // 示例精选数据
    await client.query(`
      INSERT INTO picks (id, repo_id, score, reason, date) 
      VALUES 
        ('pick-1', 'microsoft/typescript', 95.5, '强大的类型系统和广泛的生态支持', CURRENT_DATE),
        ('pick-2', 'facebook/react', 92.3, '前端开发的事实标准，生态完善', CURRENT_DATE),
        ('pick-3', 'vercel/next.js', 88.7, '全栈React框架，性能卓越', CURRENT_DATE)
      ON CONFLICT (id) DO NOTHING
    `);
    
    // 示例文章数据
    await client.query(`
      INSERT INTO articles (id, repo_id, title_cn, title_en, summary_cn, summary_en, body_cn_md, body_en_md, status) 
      VALUES 
        ('article-1', 'microsoft/typescript', 
         'TypeScript：为JavaScript带来强类型', 
         'TypeScript: Bringing Strong Typing to JavaScript',
         'TypeScript作为JavaScript的超集，为大型项目开发提供了类型安全保障。', 
         'TypeScript, as a superset of JavaScript, provides type safety for large-scale project development.',
         '# TypeScript：为JavaScript带来强类型\n\nTypeScript是微软开发的开源编程语言...',
         '# TypeScript: Bringing Strong Typing to JavaScript\n\nTypeScript is an open-source programming language developed by Microsoft...',
         'published'),
        ('article-2', 'facebook/react', 
         'React：构建用户界面的JavaScript库', 
         'React: A JavaScript Library for Building User Interfaces',
         'React通过组件化和虚拟DOM革命性地改变了前端开发方式。', 
         'React revolutionized frontend development through componentization and virtual DOM.',
         '# React：构建用户界面的JavaScript库\n\nReact是Facebook开发的开源JavaScript库...',
         '# React: A JavaScript Library for Building User Interfaces\n\nReact is an open-source JavaScript library developed by Facebook...',
         'published')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // 示例发布数据
    await client.query(`
      INSERT INTO publishes (id, article_id, platform, post_url, status) 
      VALUES 
        ('publish-1', 'article-1', 'telegram', 'https://t.me/trending_dev/123', 'published'),
        ('publish-2', 'article-1', 'devto', 'https://dev.to/user/typescript-article', 'published'),
        ('publish-3', 'article-2', 'telegram', 'https://t.me/trending_dev/124', 'published')
      ON CONFLICT (id) DO NOTHING
    `);
    
    client.release();
    
    // 验证数据
    console.log('🔍 验证数据库内容...');
    const statsClient = await pool.connect();
    
    const repoCount = await statsClient.query('SELECT COUNT(*) FROM repos');
    const articleCount = await statsClient.query('SELECT COUNT(*) FROM articles');
    const publishCount = await statsClient.query('SELECT COUNT(*) FROM publishes');
    
    console.log(`📊 数据统计:`);
    console.log(`  • 仓库数量: ${repoCount.rows[0].count}`);
    console.log(`  • 文章数量: ${articleCount.rows[0].count}`);
    console.log(`  • 发布记录: ${publishCount.rows[0].count}`);
    
    statsClient.release();
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('💡 现在可以启动应用程序并访问文章列表页面了。');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };