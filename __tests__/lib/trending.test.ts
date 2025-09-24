import { fetchTrending } from '@/lib/trending'

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Trending 抓取功能', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('应该成功抓取 TypeScript trending 项目', async () => {
    const mockHtml = `
      <div>
        <a href="/microsoft/typescript" data-view-component="true" class="Link">
          TypeScript Project
        </a>
        <a href="/vercel/next.js" data-view-component="true" class="Link">
          Next.js Project  
        </a>
      </div>
    `
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(mockHtml),
    } as Response)

    const result = await fetchTrending('typescript', 'daily')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://github.com/trending/typescript?since=daily',
      { headers: { 'user-agent': 'Mozilla/5.0' } }
    )
    
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      full_name: 'microsoft/typescript',
      lang: 'typescript',
      position: 1
    })
    expect(result[1]).toEqual({
      full_name: 'vercel/next.js', 
      lang: 'typescript',
      position: 2
    })
  })

  it('应该正确处理 all 语言的情况', async () => {
    const mockHtml = `
      <div>
        <a href="/rust-lang/rust" data-view-component="true" class="Link">
          Rust
        </a>
      </div>
    `
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(mockHtml),
    } as Response)

    const result = await fetchTrending('all', 'daily')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://github.com/trending?since=daily',
      { headers: { 'user-agent': 'Mozilla/5.0' } }
    )
    
    expect(result[0]).toEqual({
      full_name: 'rust-lang/rust',
      lang: undefined,
      position: 1
    })
  })

  it('应该处理网络请求失败', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    await expect(fetchTrending('python')).rejects.toThrow('Trending fetch failed 404')
  })

  it('应该去重相同的仓库', async () => {
    const mockHtml = `
      <div>
        <a href="/microsoft/typescript" data-view-component="true" class="Link">TypeScript</a>
        <a href="/microsoft/typescript" data-view-component="true" class="Link">TypeScript Duplicate</a>
        <a href="/vercel/next.js" data-view-component="true" class="Link">Next.js</a>
      </div>
    `
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    } as Response)

    const result = await fetchTrending('typescript')
    
    expect(result).toHaveLength(2) // 应该去重
    expect(result[0].full_name).toBe('microsoft/typescript')
    expect(result[1].full_name).toBe('vercel/next.js')
  })

  it('应该限制返回的项目数量到50个', async () => {
    // 生成超过50个不同项目的HTML
    const projects = Array.from({ length: 60 }, (_, i) => 
      `<a href="/user${i}/repo${i}" data-view-component="true" class="Link">Repo ${i}</a>`
    ).join('\n')
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`<div>${projects}</div>`),
    } as Response)

    const result = await fetchTrending('javascript')
    
    expect(result).toHaveLength(50) // 应该限制到50个
    expect(result[0].position).toBe(1)
    expect(result[49].position).toBe(50)
  })

  it('应该正确解析不同的时间范围', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<div></div>'),
    } as Response)

    await fetchTrending('go', 'weekly')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://github.com/trending/go?since=weekly',
      { headers: { 'user-agent': 'Mozilla/5.0' } }
    )
  })
})