const https = require('https');

const VERCEL_TOKEN = 'ReKRzY5Gzn10YF8dGy25Um2p';
const PROJECT_NAME = 'ghtrend-vercel';

async function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getCurrentDeploymentStatus() {
  try {
    // 获取项目信息
    const projectResponse = await makeRequest(`/v9/projects/${PROJECT_NAME}`);
    if (projectResponse.status !== 200) {
      throw new Error('获取项目信息失败');
    }
    
    const project = projectResponse.data;
    
    // 获取最新部署
    const deploymentsResponse = await makeRequest(`/v6/deployments?projectId=${project.id}&limit=1`);
    if (deploymentsResponse.status !== 200) {
      throw new Error('获取部署信息失败');
    }

    const deployments = deploymentsResponse.data.deployments;
    if (deployments.length === 0) {
      throw new Error('没有找到任何部署');
    }

    const latestDeployment = deployments[0];
    return {
      id: latestDeployment.uid,
      state: latestDeployment.state,
      url: latestDeployment.url,
      createdAt: latestDeployment.createdAt,
      buildingAt: latestDeployment.buildingAt,
      readyAt: latestDeployment.readyAt
    };
  } catch (error) {
    throw error;
  }
}

async function getDeploymentLogs(deploymentId) {
  try {
    const logsResponse = await makeRequest(`/v2/deployments/${deploymentId}/events`);
    if (logsResponse.status !== 200) {
      return null;
    }
    return logsResponse.data;
  } catch (error) {
    return null;
  }
}

function getStateEmoji(state) {
  switch (state) {
    case 'READY': return '✅';
    case 'ERROR': return '❌';
    case 'BUILDING': return '🔨';
    case 'QUEUED': return '⏳';
    case 'INITIALIZING': return '🚀';
    case 'CANCELED': return '🚫';
    default: return '❓';
  }
}

async function monitorDeployment() {
  const maxAttempts = 30; // 最多检查30次（15分钟）
  let attempts = 0;

  console.log('🔍 开始监控Vercel部署状态...\n');

  while (attempts < maxAttempts) {
    try {
      const deployment = await getCurrentDeploymentStatus();
      const timestamp = new Date().toLocaleTimeString('zh-CN');
      
      console.log(`[${timestamp}] 部署状态: ${deployment.state} ${getStateEmoji(deployment.state)}`);
      console.log(`  部署ID: ${deployment.id}`);
      console.log(`  URL: ${deployment.url || 'N/A'}`);
      
      if (deployment.state === 'READY') {
        console.log('🎉 部署成功完成！');
        console.log(`✅ 网站现在可以访问: https://${deployment.url}`);
        
        // 测试网站是否可访问
        console.log('\n🔍 测试网站访问...');
        await testWebsite(`https://${deployment.url}`);
        break;
      } else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        console.log('❌ 部署失败！');
        
        // 获取失败日志
        console.log('\n📋 获取失败日志...');
        const logs = await getDeploymentLogs(deployment.id);
        if (logs && logs.length > 0) {
          console.log('最近的构建日志:');
          logs.slice(-5).forEach(log => {
            const logTime = new Date(log.created).toLocaleTimeString('zh-CN');
            console.log(`  [${logTime}] ${log.type}: ${log.text || log.payload?.text || 'N/A'}`);
          });
        }
        break;
      } else {
        // 仍在构建中，显示进度
        const createdTime = new Date(deployment.createdAt).toLocaleTimeString('zh-CN');
        const buildingTime = deployment.buildingAt ? new Date(deployment.buildingAt).toLocaleTimeString('zh-CN') : null;
        
        console.log(`  创建时间: ${createdTime}`);
        if (buildingTime) {
          console.log(`  开始构建: ${buildingTime}`);
          const buildDuration = Math.floor((Date.now() - new Date(deployment.buildingAt).getTime()) / 1000);
          console.log(`  构建耗时: ${buildDuration}秒`);
        }
      }
      
      attempts++;
      if (attempts < maxAttempts && (deployment.state === 'BUILDING' || deployment.state === 'QUEUED' || deployment.state === 'INITIALIZING')) {
        console.log(`\n⏳ 等待30秒后再次检查... (${attempts}/${maxAttempts})\n`);
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      console.error(`❌ 检查部署状态时发生错误: ${error.message}`);
      attempts++;
      if (attempts < maxAttempts) {
        console.log('⏳ 30秒后重试...\n');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }

  if (attempts >= maxAttempts) {
    console.log('⚠️ 已达到最大重试次数，停止监控');
  }
}

async function testWebsite(url) {
  return new Promise((resolve) => {
    const https = require('https');
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ 网站访问正常 (状态码: ${res.statusCode})`);
      } else {
        console.log(`⚠️ 网站返回异常状态码: ${res.statusCode}`);
      }
      resolve();
    });

    req.on('error', (e) => {
      console.log(`❌ 网站访问失败: ${e.message}`);
      resolve();
    });

    req.on('timeout', () => {
      console.log('❌ 网站访问超时');
      req.abort();
      resolve();
    });

    req.end();
  });
}

// 开始监控
monitorDeployment().then(() => {
  console.log('\n✨ 监控完成');
}).catch(error => {
  console.error('❌ 监控失败:', error);
});