#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';

// 从 .env.example 读取需要的环境变量
const requiredEnvVars = [
  { key: 'POSTGRES_URL', value: 'postgresql://username:password@localhost:5432/dbname', type: 'encrypted' },
  { key: 'GITHUB_TOKEN', value: 'your_github_token_here', type: 'encrypted' },
  { key: 'OPENAI_API_KEY', value: 'your_openai_api_key_here', type: 'encrypted' },
  { key: 'TELEGRAM_BOT_TOKEN', value: 'your_telegram_bot_token_here', type: 'encrypted' },
  { key: 'TELEGRAM_CHAT_ID', value: 'your_telegram_chat_id_here', type: 'encrypted' },
  { key: 'DEVTO_API_KEY', value: 'your_devto_api_key_here', type: 'encrypted' },
  { key: 'MEDIUM_TOKEN', value: 'your_medium_token_here', type: 'encrypted' },
  { key: 'MEDIUM_AUTHOR_ID', value: 'your_medium_author_id_here', type: 'encrypted' },
  { key: 'WEBHOOK_SECRET', value: 'your_webhook_secret_here', type: 'encrypted' },
  { key: 'CRON_SECRET', value: 'your_cron_secret_here', type: 'encrypted' },
  { key: 'NODE_ENV', value: 'production', type: 'plain' }
];

async function getProjects() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: '/v9/projects',
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

async function setEnvironmentVariable(projectId, envVar) {
  const envData = {
    key: envVar.key,
    value: envVar.value,
    type: envVar.type || 'encrypted',
    target: ['production', 'preview', 'development']
  };

  const postData = JSON.stringify(envData);

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v10/projects/${projectId}/env`,
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

async function triggerDeployment(projectId) {
  const deployData = {
    name: 'ghtrend-vercel',
    gitSource: {
      type: 'github',
      repo: 'lawrencezcl/ghtrend-vercel',
      ref: 'main'
    },
    target: 'production'
  };

  const postData = JSON.stringify(deployData);

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

async function main() {
  try {
    console.log('🔍 查找项目...');
    const projects = await getProjects();
    
    const project = projects.projects.find(p => p.name === 'ghtrend-vercel');
    
    if (!project) {
      throw new Error('找不到 ghtrend-vercel 项目');
    }
    
    console.log(`✅ 找到项目: ${project.name} (ID: ${project.id})`);
    
    console.log('\n⚙️ 配置环境变量...');
    
    for (const envVar of requiredEnvVars) {
      try {
        await setEnvironmentVariable(project.id, envVar);
        console.log(`✅ ${envVar.key}: 已设置`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ ${envVar.key}: 已存在，跳过`);
        } else {
          console.log(`❌ ${envVar.key}: ${error.message}`);
        }
      }
    }
    
    console.log('\n🚀 触发部署...');
    const deployment = await triggerDeployment(project.id);
    
    console.log('✅ 部署已开始！');
    console.log(`📦 部署ID: ${deployment.id}`);
    console.log(`🌐 预览URL: ${deployment.url}`);
    
    console.log('\n📋 部署总结:');
    console.log(`• GitHub 仓库: https://github.com/lawrencezcl/ghtrend-vercel`);
    console.log(`• Vercel 项目: https://vercel.com/dashboard/projects/${project.id}`);
    console.log(`• 应用 URL: https://${project.name}.vercel.app`);
    
    console.log('\n⚠️ 重要提醒:');
    console.log('1. 请在 Vercel 仪表板中更新实际的环境变量值');
    console.log('2. 特别是数据库连接字符串和 API 密钥');
    console.log('3. 部署完成后，请配置 Vercel Postgres 数据库');
    console.log('4. 运行 SQL 脚本初始化数据库表结构');
    
  } catch (error) {
    console.error('❌ 配置失败:', error.message);
    process.exit(1);
  }
}

main();