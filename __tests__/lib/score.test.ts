import { scoreRepo } from '@/lib/score'
import type { RepoMeta } from '@/lib/github'

describe('评分算法', () => {
  it('应该基于排名位置计算基础分', () => {
    const repo: RepoMeta = {
      id: 'test/repo',
      stars_total: 1000,
      topics: [],
      owner_type: 'User'
    }

    // 第1名应该得到59分基础分 (60 - 1)
    const result1 = scoreRepo(repo, 1)
    expect(result1.score).toBeGreaterThan(58)
    
    // 第30名应该得到30分基础分 (60 - 30)
    const result30 = scoreRepo(repo, 30)
    expect(result30.score).toBeLessThan(result1.score)
    
    // 第100名应该得到0分基础分 (max(0, 60 - 100))
    const result100 = scoreRepo(repo, 100)
    expect(result100.score).toBeLessThan(result30.score)
  })

  it('应该基于Stars数量给予加分', () => {
    const baseRepo: RepoMeta = {
      id: 'test/repo',
      stars_total: 1000,
      topics: [],
      owner_type: 'User'
    }

    const highStarRepo: RepoMeta = {
      ...baseRepo,
      stars_total: 100000
    }

    const result1 = scoreRepo(baseRepo, 10)
    const result2 = scoreRepo(highStarRepo, 10)

    expect(result2.score).toBeGreaterThan(result1.score)
  })

  it('应该为AI/ML相关话题给予最高加分', () => {
    const aiRepo: RepoMeta = {
      id: 'openai/gpt',
      stars_total: 1000,
      topics: ['ai', 'machine-learning', 'llm'],
      owner_type: 'Organization'
    }

    const normalRepo: RepoMeta = {
      id: 'user/normal',
      stars_total: 1000,
      topics: ['javascript'],
      owner_type: 'User'
    }

    const aiResult = scoreRepo(aiRepo, 10)
    const normalResult = scoreRepo(normalRepo, 10)

    expect(aiResult.score).toBeGreaterThan(normalResult.score)
    expect(aiResult.reason).toContain('topics:15') // AI加分15分
  })

  it('应该为热门编程语言给予加分', () => {
    const rustRepo: RepoMeta = {
      id: 'rust-lang/rust',
      lang: 'Rust',
      stars_total: 1000,
      topics: ['rust', 'systems-programming'],
      owner_type: 'Organization'
    }

    const phpRepo: RepoMeta = {
      id: 'user/php-app',
      lang: 'PHP',
      stars_total: 1000,
      topics: ['web'],
      owner_type: 'User'
    }

    const rustResult = scoreRepo(rustRepo, 10)
    const phpResult = scoreRepo(phpRepo, 10)

    expect(rustResult.score).toBeGreaterThan(phpResult.score)
    expect(rustResult.reason).toContain('lang:+3') // Rust语言加分
  })

  it('应该为组织项目给予额外加分', () => {
    const orgRepo: RepoMeta = {
      id: 'microsoft/typescript',
      stars_total: 1000,
      topics: [],
      owner_type: 'Organization'
    }

    const userRepo: RepoMeta = {
      id: 'user/project',
      stars_total: 1000,
      topics: [],
      owner_type: 'User'
    }

    const orgResult = scoreRepo(orgRepo, 10)
    const userResult = scoreRepo(userRepo, 10)

    expect(orgResult.score).toBeGreaterThan(userResult.score)
    expect(orgResult.reason).toContain('owner:+2')
  })

  it('应该为多个热门话题累计加分', () => {
    const multiTopicRepo: RepoMeta = {
      id: 'ai/web-framework',
      lang: 'TypeScript',
      stars_total: 1000,
      topics: ['ai', 'web', 'typescript', 'react', 'nextjs'],
      owner_type: 'Organization'
    }

    const result = scoreRepo(multiTopicRepo, 10)
    
    // 应该包含AI(15分) + Web(6分) + TypeScript(8分) + 语言(2分) + 组织(2分)的加分
    expect(result.score).toBeGreaterThan(80) // 基础分50 + stars约10 + 话题29 + 语言2 + 组织2
    expect(result.reason).toContain('topics:29') // AI + Web + TypeScript话题
  })

  it('应该生成详细的评分理由', () => {
    const repo: RepoMeta = {
      id: 'rust-lang/rust',
      lang: 'Rust',
      stars_total: 75000,
      topics: ['rust', 'systems-programming'],
      owner_type: 'Organization'
    }

    const result = scoreRepo(repo, 5)

    expect(result.reason).toMatch(/pos:5\(\d+\.\d+\)/)
    expect(result.reason).toMatch(/stars:75000\(\d+\.\d+\)/)
    expect(result.reason).toContain('topics:8')
    expect(result.reason).toContain('lang:+3')
    expect(result.reason).toContain('owner:+2')
  })

  it('应该处理空topics数组', () => {
    const repo: RepoMeta = {
      id: 'user/simple',
      stars_total: 100,
      topics: [],
      owner_type: 'User'
    }

    const result = scoreRepo(repo, 10)
    expect(result.reason).toContain('topics:0')
    expect(result.score).toBeGreaterThan(0)
  })

  it('应该处理undefined字段', () => {
    const repo: RepoMeta = {
      id: 'user/minimal',
      stars_total: 500,
      topics: []
      // lang 和 owner_type 未定义
    }

    const result = scoreRepo(repo, 15)
    expect(result.score).toBeGreaterThan(0)
    expect(result.reason).not.toContain('lang:')
    expect(result.reason).not.toContain('owner:')
  })
})