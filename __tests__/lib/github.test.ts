import { enrichRepo } from '@/lib/github'

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('GitHub API 富化功能', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('应该成功富化仓库信息', async () => {
    const mockRepoData = {
      full_name: 'microsoft/typescript',
      language: 'TypeScript',
      stargazers_count: 95000,
      topics: ['typescript', 'javascript', 'language'],
      description: 'TypeScript is a superset of JavaScript',
      homepage: 'https://www.typescriptlang.org',
      license: { spdx_id: 'Apache-2.0' },
      owner: { type: 'Organization' }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepoData),
    } as Response)

    const result = await enrichRepo('microsoft/typescript', 'test_token')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/microsoft/typescript',
      {
        headers: {
          'user-agent': 'vercel-app',
          'authorization': 'Bearer test_token'
        }
      }
    )

    expect(result).toEqual({
      id: 'microsoft/typescript',
      lang: 'TypeScript',
      stars_total: 95000,
      topics: ['typescript', 'javascript', 'language'],
      description: 'TypeScript is a superset of JavaScript',
      homepage: 'https://www.typescriptlang.org',
      license: 'Apache-2.0',
      owner_type: 'Organization'
    })
  })

  it('应该在没有token时正确请求', async () => {
    const mockRepoData = {
      full_name: 'vercel/next.js',
      language: 'JavaScript',
      stargazers_count: 110000,
      topics: ['react', 'nextjs', 'framework'],
      description: 'The React Framework',
      homepage: 'https://nextjs.org',
      license: { spdx_id: 'MIT' },
      owner: { type: 'Organization' }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepoData),
    } as Response)

    const result = await enrichRepo('vercel/next.js')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/vercel/next.js',
      {
        headers: {
          'user-agent': 'vercel-app'
        }
      }
    )

    expect(result.id).toBe('vercel/next.js')
    expect(result.lang).toBe('JavaScript')
  })

  it('应该处理缺失的可选字段', async () => {
    const mockRepoData = {
      full_name: 'rust-lang/rust',
      stargazers_count: 80000,
      // 没有 language, topics, description, homepage, license, owner
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepoData),
    } as Response)

    const result = await enrichRepo('rust-lang/rust')

    expect(result).toEqual({
      id: 'rust-lang/rust',
      lang: undefined,
      stars_total: 80000,
      topics: [],
      description: undefined,
      homepage: undefined,
      license: undefined,
      owner_type: undefined
    })
  })

  it('应该处理API请求失败', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    await expect(enrichRepo('nonexistent/repo')).rejects.toThrow('GitHub API failed 404')
  })

  it('应该处理网络错误', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(enrichRepo('test/repo')).rejects.toThrow('Network error')
  })

  it('应该处理rate limit情况', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response)

    await expect(enrichRepo('popular/repo')).rejects.toThrow('GitHub API failed 403')
  })
})