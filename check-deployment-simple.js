#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';
const PROJECT_ID = 'prj_TJahtWIPHVSLZjGescTVzHzMvpkR';

console.log('🔍 检查Vercel部署状态...');

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v6/projects/${PROJECT_ID}/deployments?limit=5`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.deployments && response.deployments.length > 0) {
        console.log('📋 最近的部署记录:');
        response.deployments.slice(0, 3).forEach((deployment, index) => {
          const status = deployment.state || deployment.readyState;
          const statusEmoji = status === 'READY' ? '✅' : status === 'ERROR' ? '❌' : status === 'BUILDING' ? '🔨' : '⏳';
          const date = new Date(deployment.createdAt).toLocaleString('zh-CN');
          
          console.log(`${statusEmoji} ${status} - ${date}`);
          console.log(`   URL: ${deployment.url}`);
          console.log(`   分支: ${deployment.meta?.githubCommitRef || 'unknown'}`);
          if (deployment.meta?.githubCommitMessage) {
            console.log(`   提交: ${deployment.meta.githubCommitMessage.substring(0, 50)}...`);
          }
          console.log('');
        });
        
        const latestDeployment = response.deployments[0];
        if (latestDeployment.state === 'READY') {
          console.log('🎉 最新部署成功！');
          console.log(`🌐 生产地址: https://${latestDeployment.url}`);
          
          // 测试网站可访问性
          console.log('\n🧪 测试网站可访问性...');
          testWebsite(`https://${latestDeployment.url}`);
        } else if (latestDeployment.state === 'BUILDING') {
          console.log('🔨 部署正在进行中...');
        } else if (latestDeployment.state === 'ERROR') {
          console.log('❌ 最新部署失败');
        }
      } else {
        console.log('📭 没有找到部署记录');
      }
    } catch (error) {
      console.error('❌ 解析响应失败:', error.message);
      console.log('📄 原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.end();

function testWebsite(url) {
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000
  };
  
  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ 网站可正常访问!');
      console.log(`📊 状态码: ${res.statusCode}`);
    } else {
      console.log(`⚠️ 网站返回状态码: ${res.statusCode}`);
    }
  });
  
  req.on('error', (error) => {
    console.log(`❌ 网站无法访问: ${error.message}`);
  });
  
  req.setTimeout(10000, () => {
    console.log('❌ 网站访问超时');
    req.abort();
  });
  
  req.end();
}