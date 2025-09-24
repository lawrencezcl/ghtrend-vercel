#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';
const PROJECT_ID = 'prj_TJahtWIPHVSLZjGescTVzHzMvpkR';

console.log('🚀 触发Vercel重新部署...');
console.log('📦 项目ID:', PROJECT_ID);

// 创建新的部署
const deploymentData = JSON.stringify({
  name: 'ghtrend-vercel',
  gitSource: {
    type: 'github',
    repo: 'lawrencezcl/ghtrend-vercel',
    ref: 'main'
  },
  target: 'production'
});

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: '/v13/deployments',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(deploymentData)
  }
};

const req = https.request(options, (res) => {
  console.log(`📊 状态码: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ 部署触发成功!');
      console.log('🔗 部署ID:', response.id);
      console.log('🌐 部署URL:', response.url);
      console.log('📋 状态:', response.readyState || response.state);
      
      if (response.alias && response.alias.length > 0) {
        console.log('🎯 生产域名:', response.alias[0]);
      }
      
      console.log('\n⏱️ 部署通常需要2-5分钟完成');
      console.log('🔍 您可以访问 https://vercel.com/dashboard 查看部署进度');
    } catch (error) {
      console.error('❌ 解析响应失败:', error.message);
      console.log('📄 原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.write(deploymentData);
req.end();