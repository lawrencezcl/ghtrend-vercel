import { composeArticle } from '@/lib/generate'

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Mock OpenAI response
const mockOpenAIResponse = {
  choices: [{
    message: {
      content: JSON.stringify({
        title_en: 'Revolutionary AI Framework for Web Development',
        title_cn: '革命性的Web开发AI框架',
        summary_en: 'Why it matters: This framework combines AI and web development seamlessly\nHighlights: stars 25000, topics ai, web, framework',
        summary_cn: '为什么重要：这个框架完美结合了AI和Web开发\n亮点：Stars 25000，话题 ai、web、framework',
        body_md_en: '# Revolutionary AI Framework\n\nThis amazing framework...\n\n- Repo: https://github.com/ai/framework',
        body_md_cn: '# 革命性AI框架\n\n这个令人惊叹的框架...\n\n- 仓库：https://github.com/ai/framework',
        tags: ['ai', 'web', 'framework']
      })
    }
  }]
}

describe('文章生成功能', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('应该使用OpenAI生成高质量内容', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockOpenAIResponse),
    } as Response)

    const result = await composeArticle({
      id: 'ai/framework',
      stars_total: 25000,
      topics: ['ai', 'web', 'framework'],
      description: 'Revolutionary AI framework for web development'
    }, 'test_api_key')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_api_key',
          'Content-Type': 'application/json'
        })
      })
    )

    expect(result.title_en).toBe('Revolutionary AI Framework for Web Development')
    expect(result.title_cn).toBe('革命性的Web开发AI框架')
    expect(result.tags).toEqual(['ai', 'web', 'framework'])
  })

  it('应该在没有API Key时使用模板生成内容', async () => {
    const result = await composeArticle({
      id: 'microsoft/typescript',
      stars_total: 95000,
      topics: ['typescript', 'javascript', 'language'],
      description: 'TypeScript is a superset of JavaScript'
    })

    // 不应该调用API
    expect(mockFetch).not.toHaveBeenCalled()

    // 应该生成基于模板的内容
    expect(result.title_en).toContain('Microsoft Typescript')
    expect(result.title_en).toContain('TypeScript is a superset of JavaScript')
    expect(result.title_cn).toContain('Microsoft Typescript')
    expect(result.summary_en).toContain('Why it matters')
    expect(result.summary_cn).toContain('为什么值得关注')
    expect(result.body_md_en).toContain('https://github.com/microsoft/typescript')
    expect(result.body_md_cn).toContain('https://github.com/microsoft/typescript')
  })

  it('应该正确处理标题长度限制', async () => {
    const result = await composeArticle({
      id: 'user/very-long-repository-name-that-should-be-truncated-properly',
      stars_total: 1000,
      topics: ['javascript'],
      description: 'A very long description that should be handled properly in the title generation process and not cause any issues'
    })

    expect(result.title_en.length).toBeLessThanOrEqual(90)
    expect(result.title_cn.length).toBeLessThanOrEqual(30)
  })

  it('应该处理缺失的description', async () => {
    const result = await composeArticle({
      id: 'user/simple-repo',
      stars_total: 500,
      topics: ['go'],
      description: undefined
    })

    expect(result.title_en).toContain('User Simple Repo')
    expect(result.title_en).toContain('Trending on GitHub')
    expect(result.summary_en).toContain('A notable trending repository')
    expect(result.body_md_en).toContain('https://github.com/user/simple-repo')
  })

  it('应该正确处理topics标签', async () => {
    const result = await composeArticle({
      id: 'rust-lang/rust',
      stars_total: 80000,
      topics: ['rust', 'systems-programming', 'compiler', 'performance', 'memory-safety', 'concurrency', 'extra-topic'],
      description: 'A language empowering everyone to build reliable and efficient software'
    })

    // 应该限制到6个topics
    expect(result.tags?.length).toBeLessThanOrEqual(6)
    expect(result.tags).toContain('rust')
    expect(result.tags).toContain('systems-programming')
  })

  it('应该处理空topics数组', async () => {
    const result = await composeArticle({
      id: 'user/notags',
      stars_total: 100,
      topics: [],
      description: 'Repository without topics'
    })

    expect(result.summary_en).toContain('topics n/a')
    expect(result.summary_cn).toContain('话题 无')
  })

  it('应该处理OpenAI API错误', async () => {
    mockFetch.mockRejectedValueOnce(new Error('OpenAI API Error'))

    // 应该回退到模板生成
    const result = await composeArticle({
      id: 'test/repo',
      stars_total: 1000,
      topics: ['test'],
      description: 'Test repository'
    }, 'invalid_key')

    expect(result.title_en).toContain('Test Repo')
    expect(result.body_md_en).toContain('https://github.com/test/repo')
  })

  it('应该处理OpenAI返回的无效JSON', async () => {
    const invalidResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON content'
        }
      }]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(invalidResponse),
    } as Response)

    // 应该回退到模板生成
    const result = await composeArticle({
      id: 'test/repo',
      stars_total: 1000,
      topics: ['test'],
      description: 'Test repository'
    }, 'test_key')

    expect(result.title_en).toContain('Test Repo')
  })

  it('应该正确转换仓库名为标题格式', async () => {
    const testCases = [
      { input: 'microsoft/typescript', expected: 'Microsoft Typescript' },
      { input: 'vercel/next.js', expected: 'Vercel Next.js' },
      { input: 'facebook/react-native', expected: 'Facebook React Native' },
      { input: 'single-word-repo', expected: 'Single Word Repo' }
    ]

    for (const testCase of testCases) {
      const result = await composeArticle({
        id: testCase.input,
        stars_total: 1000,
        topics: [],
        description: 'Test description'
      })

      expect(result.title_en).toContain(testCase.expected)
    }
  })
})