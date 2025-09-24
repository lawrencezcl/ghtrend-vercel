#!/usr/bin/env node

const { Pool } = require('pg');
const https = require('https');

// 使用更新后的数据库URL
const DATABASE_URL = "postgresql://neondb_owner:npg_w9QEDSlLkyT3@ep-jolly-hill-adhlaq48-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function testDatabase() {
  console.log('🗄️ 测试数据库连接...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('✅ 数据库连接成功！');
    
    // 检查表结构
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 现有表:', tables.rows.map(r => r.table_name).join(', '));
    
    // 检查文章数据
    const articleCount = await client.query('SELECT COUNT(*) FROM articles WHERE status = $1', ['published']);
    console.log(`📰 已发布文章数量: ${articleCount.rows[0].count}`);
    
    // 检查最近的文章
    const recentArticles = await client.query(`
      SELECT a.id, a.title_cn, a.title_en, a.created_at, r.lang, r.stars_total
      FROM articles a
      LEFT JOIN repos r ON a.repo_id = r.id
      WHERE a.status = 'published'
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('📚 最近的文章:');
    recentArticles.rows.forEach((article, index) => {
      const title = article.title_cn || article.title_en;
      console.log(`  ${index + 1}. ${title} (${article.lang}, ⭐${article.stars_total})`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  } finally {
    await pool.end();
  }
  
  return true;
}

async function testWebsite() {
  console.log('🌐 测试网站访问...');
  
  const testUrls = [
    'https://ghtrend-vercel.vercel.app',
    'https://ghtrend-vercel.vercel.app/articles',
    'https://ghtrend-vercel.vercel.app/admin'
  ];
  
  for (const url of testUrls) {
    try {
      const result = await testUrl(url);
      if (result.success) {
        console.log(`✅ ${url} - 状态码: ${result.status}`);
      } else {
        console.log(`❌ ${url} - 错误: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - 异常: ${error.message}`);
    }
  }
}

function testUrl(url) {
  return new Promise((resolve) => {
    const urlParts = new URL(url);
    const options = {
      hostname: urlParts.hostname,
      port: urlParts.port || 443,
      path: urlParts.pathname,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({
        success: res.statusCode < 400,
        status: res.statusCode
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        error: e.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function main() {
  console.log('🧪 GitHub Trending Auto-Publisher 系统测试');
  console.log('='.repeat(50));
  
  const dbSuccess = await testDatabase();
  console.log('');
  
  await testWebsite();
  console.log('');
  
  if (dbSuccess) {
    console.log('🎉 系统测试完成！');
    console.log('💡 提示:');
    console.log('  • 数据库已初始化并包含示例数据');
    console.log('  • 访问 /articles 查看文章列表');
    console.log('  • 访问 /admin 查看管理面板');
    console.log('  • 文章详情页支持SEO优化和分享功能');
  } else {
    console.log('⚠️ 请检查数据库配置和连接。');
  }
}

main().catch(console.error);