#!/usr/bin/env node

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(`${BASE_URL}${path}`, (res) => {
      const responseTime = Date.now() - startTime;
      let body = '';
      
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const statusEmoji = res.statusCode < 400 ? '✅' : '❌';
        console.log(`${statusEmoji} ${description}`);
        console.log(`   URL: ${BASE_URL}${path}`);
        console.log(`   状态码: ${res.statusCode}`);
        console.log(`   响应时间: ${responseTime}ms`);
        
        if (res.statusCode < 400) {
          if (body.includes('<title>')) {
            const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/);
            const title = titleMatch ? titleMatch[1] : '未找到标题';
            console.log(`   页面标题: ${title}`);
          }
          
          if (body.includes('article-') || body.includes('GitHub Trending')) {
            console.log(`   ✅ 包含预期内容`);
          }
        } else {
          console.log(`   ❌ 错误: ${res.statusMessage}`);
        }
        
        console.log('');
        resolve({
          path,
          status: res.statusCode,
          responseTime,
          success: res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}`);
      console.log(`   URL: ${BASE_URL}${path}`);
      console.log(`   错误: ${err.message}`);
      console.log('');
      resolve({
        path,
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.abort();
      console.log(`❌ ${description}`);
      console.log(`   URL: ${BASE_URL}${path}`);
      console.log(`   错误: 请求超时`);
      console.log('');
      resolve({
        path,
        status: 0,
        responseTime: 10000,
        success: false,
        error: '请求超时'
      });
    });
  });
}

async function runTests() {
  console.log('🧪 本地开发服务器测试');
  console.log('='.repeat(40));
  console.log(`🌐 测试服务器: ${BASE_URL}`);
  console.log('');
  
  const tests = [
    ['/', '首页'],
    ['/articles', '文章列表页'],
    ['/articles/article-1', '文章详情页 - 示例文章1'],
    ['/articles/article-3', '文章详情页 - Next.js文章'],
    ['/articles/article-4', '文章详情页 - Whisper文章'],
    ['/articles/article-5', '文章详情页 - Supabase文章'],
    ['/admin', '管理页面'],
    ['/api/cron/fetch', 'API - 抓取数据'],
    ['/api/health', 'API - 健康检查']
  ];
  
  const results = [];
  
  for (const [path, description] of tests) {
    const result = await testEndpoint(path, description);
    results.push(result);
    // 短暂延迟避免过快请求
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 测试汇总');
  console.log('='.repeat(40));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ 成功: ${successful.length}/${results.length}`);
  console.log(`❌ 失败: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\\n🔍 失败的测试:');
    failed.forEach(result => {
      console.log(`   ${result.path} - ${result.error || `状态码 ${result.status}`}`);
    });
  }
  
  console.log('\\n⏱️ 响应时间统计:');
  const responseTimes = successful.map(r => r.responseTime);
  if (responseTimes.length > 0) {
    const avgTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);
    
    console.log(`   平均: ${avgTime}ms`);
    console.log(`   最快: ${minTime}ms`);
    console.log(`   最慢: ${maxTime}ms`);
  }
  
  if (successful.length === results.length) {
    console.log('\\n🎉 所有测试通过！本地开发服务器运行正常。');
  } else {
    console.log('\\n⚠️  部分测试失败，请检查服务器状态和数据库连接。');
  }
}

// 运行测试
runTests().catch(console.error);