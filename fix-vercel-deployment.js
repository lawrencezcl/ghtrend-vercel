#!/usr/bin/env node

const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';
const PROJECT_ID = 'prj_TJahtWIPHVSLZjGescTVzHzMvpkR';

async function updateEnvironmentVariable(key, value) {
  // 先删除现有的环境变量
  try {
    await deleteEnvironmentVariable(key);
  } catch (error) {
    // 忽略删除错误，可能变量不存在
  }

  // 创建新的环境变量
  const envData = {
    key: key,
    value: value,
    type: 'encrypted',
    target: ['production', 'preview', 'development']
  };

  const postData = JSON.stringify(envData);

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v10/projects/${PROJECT_ID}/env`,
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
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
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

async function deleteEnvironmentVariable(key) {
  // 先获取环境变量列表
  const envVars = await getEnvironmentVariables();
  const envVar = envVars.find(env => env.key === key);
  
  if (!envVar) {
    return; // 变量不存在
  }

  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v9/projects/${PROJECT_ID}/env/${envVar.id}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 204) {
        resolve({ success: true });
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function getEnvironmentVariables() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v9/projects/${PROJECT_ID}/env`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
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
            resolve(response.envs || []);
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

async function triggerDeployment() {
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v13/deployments`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    }
  };

  const deployData = JSON.stringify({
    name: 'ghtrend-vercel',
    gitSource: {
      type: 'github',
      repo: 'lawrencezcl/ghtrend-vercel',
      ref: 'main'
    },
    target: 'production'
  });

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

    req.write(deployData);
    req.end();
  });
}

async function main() {
  console.log('🔧 修复Vercel部署问题...');
  
  try {
    // 更新关键环境变量
    console.log('⚙️ 更新数据库环境变量...');
    
    const dbUrl = "postgresql://neondb_owner:npg_w9QEDSlLkyT3@ep-jolly-hill-adhlaq48-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    await updateEnvironmentVariable('DATABASE_URL', dbUrl);
    console.log('✅ DATABASE_URL 已更新');
    
    await updateEnvironmentVariable('POSTGRES_URL', dbUrl);
    console.log('✅ POSTGRES_URL 已更新');
    
    await updateEnvironmentVariable('NODE_ENV', 'production');
    console.log('✅ NODE_ENV 已更新');
    
    // 触发重新部署
    console.log('🚀 触发重新部署...');
    const deployment = await triggerDeployment();
    
    console.log('✅ 部署已触发！');
    console.log(`📦 部署ID: ${deployment.id}`);
    console.log(`🌐 预览URL: ${deployment.url}`);
    
    console.log('\\n📋 修复总结:');
    console.log('• 更新了数据库连接字符串');
    console.log('• 添加了环境变量检查');
    console.log('• 改进了数据库连接池配置');
    console.log('• 触发了新的部署');
    
    console.log('\\n⏳ 请等待几分钟让部署完成，然后访问:');
    console.log(`• 主站: https://ghtrend-vercel.vercel.app`);
    console.log(`• 文章列表: https://ghtrend-vercel.vercel.app/articles`);
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    process.exit(1);
  }
}

main();