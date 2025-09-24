#!/usr/bin/env node

const https = require('https');

console.log('🧪 测试GitHub Trending网站可访问性...');
console.log('🌐 测试地址: https://ghtrend-vercel.vercel.app');

function testWebsite(url, description) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const startTime = Date.now();
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Vercel Deployment Test)'
      }
    };
    
    const req = https.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const statusEmoji = res.statusCode < 400 ? '✅' : '❌';
        console.log(`${statusEmoji} ${description}`);
        console.log(`   URL: ${url}`);
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   响应时间: ${responseTime}ms`);
        
        if (res.statusCode === 200) {
          if (data.includes('<title>')) {
            const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/);
            const title = titleMatch ? titleMatch[1] : '未找到标题';
            console.log(`   页面标题: ${title}`);
          }
          
          if (data.includes('GitHub Trending') || data.includes('文章') || data.includes('article')) {
            console.log(`   ✅ 包含预期内容`);
          } else {
            console.log(`   ⚠️ 内容可能不完整`);
          }
        } else {
          console.log(`   ❌ 错误: ${res.statusMessage}`);
        }
        
        console.log('');
        resolve({ success: res.statusCode === 200, statusCode: res.statusCode, responseTime });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${description}`);
      console.log(`   URL: ${url}`);
      console.log(`   错误: ${error.message}`);
      console.log('');
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(15000, () => {
      console.log(`❌ ${description}`);
      console.log(`   URL: ${url}`);
      console.log(`   错误: 请求超时`);
      console.log('');
      req.abort();
      resolve({ success: false, error: '请求超时' });
    });
    
    req.end();
  });
}

async function runTests() {
  const tests = [
    ['https://ghtrend-vercel.vercel.app/', '主页'],
    ['https://ghtrend-vercel.vercel.app/articles', '文章列表页'],
    ['https://ghtrend-vercel.vercel.app/articles/article-3', 'Next.js文章页'],
    ['https://ghtrend-vercel.vercel.app/articles/article-4', 'Whisper文章页'],
    ['https://ghtrend-vercel.vercel.app/articles/article-5', 'Supabase文章页']
  ];
  
  const results = [];
  
  for (const [url, description] of tests) {
    const result = await testWebsite(url, description);
    results.push({ url, description, ...result });
    
    // 短暂延迟避免过快请求
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 测试汇总');
  console.log('='.repeat(40));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ 成功: ${successful.length}/${results.length}`);
  console.log(`❌ 失败: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\\n🎉 部署状态总结:');
    if (successful.length === results.length) {
      console.log('✅ Vercel部署完全成功！所有页面正常访问');
      console.log('🌐 网站地址: https://ghtrend-vercel.vercel.app');
      console.log('📱 用户可以正常使用所有功能');
    } else {
      console.log(`✅ 部分功能可用 (${successful.length}/${results.length})`);
      console.log('🌐 网站地址: https://ghtrend-vercel.vercel.app');
    }
  } else {
    console.log('\\n❌ 部署可能还未完成或存在问题');
    console.log('⏳ 建议等待几分钟后重新检查');
  }
}

runTests().catch(console.error);