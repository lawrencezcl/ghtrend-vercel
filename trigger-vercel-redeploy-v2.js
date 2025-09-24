#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';

console.log('🚀 触发Vercel重新部署...');
console.log('🔧 使用GitHub集成触发方式');

// 使用简化的部署触发方式
const deploymentData = JSON.stringify({
  name: 'ghtrend-vercel',
  gitSource: {
    type: 'github',
    repo: 'lawrencezcl/ghtrend-vercel',
    ref: 'main'
  }
});

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: '/v6/deployments',
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
    console.log('📄 响应数据:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ 部署触发成功!');
        if (response.id) {
          console.log('🔗 部署ID:', response.id);
        }
        if (response.url) {
          console.log('🌐 部署URL:', response.url);
        }
      } else {
        console.log('❌ 部署触发失败');
        if (response.error) {
          console.log('💬 错误信息:', response.error.message);
        }
      }
    } catch (error) {
      console.log('📄 原始响应:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
});

req.write(deploymentData);
req.end();