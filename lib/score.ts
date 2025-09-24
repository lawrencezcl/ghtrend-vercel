import type { RepoMeta } from './github'

export function scoreRepo(meta: RepoMeta, position: number) {
  // 基础分：基于trending排名位置，排名越靠前分数越高
  const base = Math.max(0, 60 - position)
  
  // 星标加分：基于项目受欢迎程度，使用对数函数避免过大偏差
  const stars = Math.log10(Math.max(1, meta.stars_total || 1)) * 10
  
  // 话题加分：给热门技术话题更高权重
  const topicBonus = getTopicBonus(meta.topics)
  
  // 语言加分：给流行语言一定加分
  const langBonus = getLanguageBonus(meta.lang)
  
  // 项目类型加分：根据owner类型调整
  const ownerBonus = getOwnerBonus(meta.owner_type)
  
  const totalScore = base + stars + topicBonus + langBonus + ownerBonus
  
  const reason = [
    `pos:${position}(${base.toFixed(1)})`,
    `stars:${meta.stars_total}(${stars.toFixed(1)})`,
    `topics:${topicBonus > 0 ? '+' : ''}${topicBonus}`,
    meta.lang && langBonus > 0 ? `lang:+${langBonus}` : null,
    ownerBonus !== 0 ? `owner:${ownerBonus > 0 ? '+' : ''}${ownerBonus}` : null
  ].filter(Boolean).join(', ')
  
  return { score: totalScore, reason }
}

function getTopicBonus(topics: string[] = []): number {
  const topicMap = topics.map(t => t.toLowerCase())
  let bonus = 0
  
  // AI/机器学习相关 - 最高权重
  if (topicMap.some(t => ['ai', 'artificial-intelligence', 'machine-learning', 'ml', 'llm', 
                          'large-language-model', 'chatgpt', 'openai', 'agent', 'gpt', 
                          'deep-learning', 'neural-network', 'tensorflow', 'pytorch'].includes(t))) {
    bonus += 15
  }
  
  // 热门编程语言
  if (topicMap.some(t => ['rust', 'go', 'typescript', 'zig', 'kotlin', 'swift'].includes(t))) {
    bonus += 8
  }
  
  // Web开发相关
  if (topicMap.some(t => ['web', 'frontend', 'react', 'nextjs', 'vue', 'svelte', 
                          'web-framework', 'full-stack', 'backend'].includes(t))) {
    bonus += 6
  }
  
  // 开发工具和DevOps
  if (topicMap.some(t => ['devops', 'docker', 'kubernetes', 'ci-cd', 'automation', 
                          'cli', 'developer-tools', 'productivity'].includes(t))) {
    bonus += 5
  }
  
  // 数据库和存储
  if (topicMap.some(t => ['database', 'nosql', 'redis', 'postgresql', 'mongodb', 
                          'storage', 'distributed-systems'].includes(t))) {
    bonus += 4
  }
  
  // 区块链和加密货币
  if (topicMap.some(t => ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 
                          'web3', 'defi', 'nft'].includes(t))) {
    bonus += 3
  }
  
  return bonus
}

function getLanguageBonus(lang?: string): number {
  if (!lang) return 0
  
  const language = lang.toLowerCase()
  
  // 热门系统编程语言
  if (['rust', 'go', 'zig'].includes(language)) return 3
  
  // 现代Web语言
  if (['typescript', 'javascript'].includes(language)) return 2
  
  // 其他流行语言
  if (['python', 'java', 'kotlin', 'swift', 'c++', 'c#'].includes(language)) return 1
  
  return 0
}

function getOwnerBonus(ownerType?: string): number {
  if (!ownerType) return 0
  
  // 组织项目通常质量更高
  if (ownerType.toLowerCase() === 'organization') return 2
  
  // 个人项目保持中性
  return 0
}