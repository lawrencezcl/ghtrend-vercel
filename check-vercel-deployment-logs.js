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

async function checkDeploymentLogs() {
  try {
    console.log('🔍 检查Vercel部署状态和日志...\n');

    // 1. 获取项目信息
    console.log('1. 获取项目信息...');
    const projectResponse = await makeRequest(`/v9/projects/${PROJECT_NAME}`);
    if (projectResponse.status !== 200) {
      console.error('❌ 获取项目信息失败:', projectResponse.data);
      return;
    }
    
    const project = projectResponse.data;
    console.log(`✅ 项目名称: ${project.name}`);
    console.log(`✅ 项目ID: ${project.id}`);
    console.log(`✅ 框架: ${project.framework || 'Unknown'}`);
    console.log(`✅ 最后更新: ${new Date(project.updatedAt).toLocaleString('zh-CN')}\n`);

    // 2. 获取最近的部署
    console.log('2. 获取最近的部署...');
    const deploymentsResponse = await makeRequest(`/v6/deployments?projectId=${project.id}&limit=5`);
    if (deploymentsResponse.status !== 200) {
      console.error('❌ 获取部署信息失败:', deploymentsResponse.data);
      return;
    }

    const deployments = deploymentsResponse.data.deployments;
    console.log(`📋 找到 ${deployments.length} 个最近的部署:\n`);

    for (let i = 0; i < Math.min(deployments.length, 3); i++) {
      const deployment = deployments[i];
      console.log(`部署 ${i + 1}:`);
      console.log(`  ID: ${deployment.uid}`);
      console.log(`  状态: ${deployment.state} ${getStateEmoji(deployment.state)}`);
      console.log(`  URL: ${deployment.url || 'N/A'}`);
      console.log(`  创建时间: ${new Date(deployment.createdAt).toLocaleString('zh-CN')}`);
      console.log(`  构建时间: ${deployment.buildingAt ? new Date(deployment.buildingAt).toLocaleString('zh-CN') : 'N/A'}`);
      console.log(`  就绪时间: ${deployment.readyAt ? new Date(deployment.readyAt).toLocaleString('zh-CN') : 'N/A'}`);
      
      // 如果部署失败，获取详细日志
      if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        console.log(`\n🔍 获取失败部署的详细日志...`);
        await getDeploymentLogs(deployment.uid);
      }
      console.log('');
    }

    // 3. 检查当前活跃部署
    const activeDeployment = deployments.find(d => d.state === 'READY');
    if (activeDeployment) {
      console.log(`🌟 当前活跃部署: ${activeDeployment.url}`);
      console.log(`📅 部署时间: ${new Date(activeDeployment.createdAt).toLocaleString('zh-CN')}\n`);
    } else {
      console.log('⚠️ 没有找到活跃的部署\n');
    }

    // 4. 检查环境变量
    console.log('3. 检查环境变量...');
    const envResponse = await makeRequest(`/v9/projects/${project.id}/env`);
    if (envResponse.status === 200) {
      const envVars = envResponse.data.envs || [];
      console.log(`✅ 找到 ${envVars.length} 个环境变量:`);
      envVars.forEach(env => {
        console.log(`  ${env.key}: ${env.value ? '[设置]' : '[未设置]'} (${env.target.join(', ')})`);
      });
    } else {
      console.log('❌ 无法获取环境变量信息');
    }

  } catch (error) {
    console.error('❌ 检查部署日志时发生错误:', error);
  }
}

async function getDeploymentLogs(deploymentId) {
  try {
    console.log(`📋 获取部署 ${deploymentId} 的日志...`);
    
    const logsResponse = await makeRequest(`/v2/deployments/${deploymentId}/events`);
    if (logsResponse.status !== 200) {
      console.error('❌ 获取日志失败:', logsResponse.data);
      return;
    }

    const logs = logsResponse.data;
    if (logs && logs.length > 0) {
      console.log('📋 部署日志:');
      logs.slice(-10).forEach(log => {
        const timestamp = new Date(log.created).toLocaleTimeString('zh-CN');
        console.log(`  [${timestamp}] ${log.type}: ${log.text || log.payload?.text || 'N/A'}`);
      });
    } else {
      console.log('  没有可用的日志信息');
    }
  } catch (error) {
    console.error('❌ 获取日志时发生错误:', error);
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

// 运行检查
checkDeploymentLogs().then(() => {
  console.log('\n✨ 部署状态检查完成');
}).catch(error => {
  console.error('❌ 运行失败:', error);
});