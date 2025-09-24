#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';

async function createDeployment() {
  console.log('🚀 开始部署到 Vercel...');
  
  const deploymentData = {
    name: 'ghtrend-vercel',
    files: {},
    builds: [
      {
        src: 'package.json',
        use: '@vercel/next'
      }
    ],
    routes: [
      {
        src: '/(.*)',
        dest: '/$1'
      }
    ],
    env: {
      NODE_ENV: 'production'
    },
    regions: ['hkg1'], // Hong Kong region for better performance
    github: {
      enabled: false
    }
  };

  // 读取主要文件
  const filesToInclude = [
    'package.json',
    'next.config.mjs',
    'tsconfig.json',
    'tailwind.config.js',
    'postcss.config.js',
    'vercel.json'
  ];

  for (const file of filesToInclude) {
    if (fs.existsSync(file)) {
      deploymentData.files[file] = {
        file: fs.readFileSync(file, 'utf8')
      };
    }
  }

  const postData = JSON.stringify(deploymentData);

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: '/v13/deployments',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
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
          if (res.statusCode === 200 || res.statusCode === 201) {
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

    req.write(postData);
    req.end();
  });
}

async function linkGitHubRepo() {
  console.log('🔗 连接 GitHub 仓库...');
  
  const linkData = {
    name: 'ghtrend-vercel',
    gitRepository: {
      type: 'github',
      repo: 'lawrencezcl/ghtrend-vercel'
    },
    framework: 'nextjs'
  };

  const postData = JSON.stringify(linkData);

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: '/v9/projects',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
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
          if (res.statusCode === 200 || res.statusCode === 201) {
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

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    // 创建项目连接到GitHub
    console.log('📊 创建 Vercel 项目...');
    const project = await linkGitHubRepo();
    console.log('✅ 项目创建成功！');
    console.log(`📁 项目名称: ${project.name}`);
    console.log(`🌐 项目URL: https://${project.name}.vercel.app`);
    
    console.log('\n🎉 部署完成！');
    console.log('📝 接下来的步骤:');
    console.log('1. 在 Vercel 仪表板中配置环境变量');
    console.log('2. 等待自动部署完成');
    console.log('3. 访问您的应用程序');
    
  } catch (error) {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  }
}

main();