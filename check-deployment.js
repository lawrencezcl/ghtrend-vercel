#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';
const PROJECT_ID = 'prj_TJahtWIPHVSLZjGescTVzHzMvpkR';

async function getProjectInfo() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v9/projects/${PROJECT_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function getDeployments() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v6/deployments?projectId=${PROJECT_ID}&limit=5`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function testDeployment(url) {
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
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          accessible: res.statusCode === 200,
          headers: res.headers
        });
      });
    });

    req.on('error', (e) => {
      resolve({
        status: 0,
        accessible: false,
        error: e.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        accessible: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function getStatusEmoji(state) {
  switch (state) {
    case 'READY': return '✅';
    case 'BUILDING': return '🔨';
    case 'ERROR': return '❌';
    case 'CANCELED': return '⏹️';
    case 'QUEUED': return '⏳';
    default: return '❓';
  }
}

async function main() {
  try {
    console.log('🔍 检查项目部署状态...');
    
    // 获取项目信息
    const project = await getProjectInfo();
    console.log(`📦 项目名称: ${project.name}`);
    console.log(`🌐 主域名: https://${project.name}.vercel.app`);
    console.log(`📊 框架: ${project.framework || 'Next.js'}`);
    
    // 获取部署历史
    const deployments = await getDeployments();
    
    console.log('\n📋 最近部署记录:');
    
    if (deployments.deployments && deployments.deployments.length > 0) {
      const latestDeployment = deployments.deployments[0];
      
      for (let i = 0; i < Math.min(3, deployments.deployments.length); i++) {
        const deployment = deployments.deployments[i];
        const emoji = getStatusEmoji(deployment.state);
        console.log(`${emoji} ${deployment.state} - ${formatTime(deployment.createdAt)}`);
        console.log(`   URL: https://${deployment.url}`);
        if (deployment.source) {
          console.log(`   来源: ${deployment.source.type} (${deployment.source.ref || 'main'})`);
        }
        console.log();
      }
      
      // 测试最新部署
      console.log('🧪 测试网站可访问性...');
      const mainUrl = `https://${project.name}.vercel.app`;
      const mainTest = await testDeployment(mainUrl);
      
      console.log(`📊 主站点状态:`);
      console.log(`   URL: ${mainUrl}`);
      console.log(`   状态: ${mainTest.accessible ? '✅ 可访问' : '❌ 不可访问'}`);
      console.log(`   HTTP状态码: ${mainTest.status || 'N/A'}`);
      
      if (mainTest.error) {
        console.log(`   错误: ${mainTest.error}`);
      }
      
      // 测试特定路由
      const routes = ['/admin', '/api/demo/publish'];
      console.log('\n🔗 测试关键路由:');
      
      for (const route of routes) {
        const routeUrl = `${mainUrl}${route}`;
        const routeTest = await testDeployment(routeUrl);
        console.log(`   ${route}: ${routeTest.accessible ? '✅' : '❌'} (${routeTest.status || 'N/A'})`);
      }
      
    } else {
      console.log('❌ 没有找到部署记录');
    }
    
    console.log('\n📋 部署总结:');
    console.log(`• GitHub 仓库: https://github.com/lawrencezcl/ghtrend-vercel`);
    console.log(`• Vercel 项目: https://vercel.com/dashboard/projects/${PROJECT_ID}`);
    console.log(`• 应用 URL: https://${project.name}.vercel.app`);
    console.log(`• 管理界面: https://${project.name}.vercel.app/admin`);
    
    console.log('\n🎉 部署完成！您的GitHub Trending自动发布系统已经成功部署到Vercel。');
    console.log('\n⚠️ 下一步操作:');
    console.log('1. 在Vercel仪表板中更新实际的环境变量值');
    console.log('2. 配置Vercel Postgres数据库');
    console.log('3. 运行SQL脚本初始化数据库表结构');
    console.log('4. 设置定时任务(cron jobs)');
    console.log('5. 测试完整的抓取→生成→发布流程');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    process.exit(1);
  }
}

main();