import { publishTelegram } from '@/lib/publishers/telegram'
import { publishDevto } from '@/lib/publishers/devto'
import { publishMedium } from '@/lib/publishers/medium'

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Telegram 发布器', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token'
    process.env.TELEGRAM_CHAT_ID = '-1001234567890'
  })

  it('应该成功发布带图片的消息', async () => {
    const mockResponse = {
      ok: true,
      result: {
        message_id: 123,
        chat: { id: -1001234567890 }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await publishTelegram(
      '<b>Test Title</b>\nRepo: test/repo\nTest description',
      'https://example.com/image.png'
    )

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bot test_bot_token/sendPhoto',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData)
      })
    )

    expect(result.url).toContain('t.me/c/1234567890/123')
    expect(result.id).toBe('123')
  })

  it('应该成功发布纯文字消息', async () => {
    const mockResponse = {
      ok: true,
      result: {
        message_id: 456,
        chat: { id: -1001234567890 }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await publishTelegram('Pure text message without image')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bot test_bot_token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: '-1001234567890',
          text: 'Pure text message without image',
          parse_mode: 'HTML'
        })
      })
    )

    expect(result.id).toBe('456')
  })

  it('应该处理API错误', async () => {
    const mockErrorResponse = {
      ok: false,
      error_code: 400,
      description: 'Bad Request'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockErrorResponse),
    } as Response)

    await expect(publishTelegram('Test message')).rejects.toThrow('telegram')
  })

  it('应该处理缺失的环境变量', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN

    await expect(publishTelegram('Test message')).rejects.toThrow('missing telegram env')
  })
})

describe('DEV.to 发布器', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    process.env.DEVTO_API_KEY = 'test_devto_key'
  })

  it('应该成功发布文章', async () => {
    const mockResponse = {
      id: 123456,
      url: 'https://dev.to/user/article-123456',
      title: 'Test Article'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await publishDevto({
      title: 'Test Article',
      markdown: '# Test Article\n\nThis is a test article.',
      tags: ['javascript', 'testing'],
      description: 'A test article for unit testing',
      cover: 'https://example.com/cover.jpg'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://dev.to/api/articles',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'api-key': 'test_devto_key'
        },
        body: JSON.stringify({
          article: {
            title: 'Test Article',
            body_markdown: '# Test Article\n\nThis is a test article.',
            published: true,
            tags: ['javascript', 'testing'],
            description: 'A test article for unit testing',
            cover_image: 'https://example.com/cover.jpg'
          }
        })
      })
    )

    expect(result.url).toBe('https://dev.to/user/article-123456')
    expect(result.id).toBe('123456')
  })

  it('应该使用默认标签', async () => {
    const mockResponse = {
      id: 789,
      url: 'https://dev.to/user/article-789'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    await publishDevto({
      title: 'No Tags Article',
      markdown: '# Article without custom tags'
    })

    const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string)
    expect(requestBody.article.tags).toEqual(['github', 'trending'])
  })

  it('应该处理API错误', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: 'Validation failed' }),
    } as Response)

    await expect(publishDevto({
      title: 'Invalid Article',
      markdown: ''
    })).rejects.toThrow('devto')
  })
})

describe('Medium 发布器', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    process.env.MEDIUM_TOKEN = 'test_medium_token'
  })

  it('应该成功发布文章', async () => {
    const mockUserResponse = {
      data: { id: 'user123' }
    }

    const mockPostResponse = {
      data: {
        id: 'post456',
        url: 'https://medium.com/@user/post-456'
      }
    }

    // Mock user info request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserResponse),
    } as Response)

    // Mock post creation request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPostResponse),
    } as Response)

    const result = await publishMedium({
      title: 'Test Medium Article',
      html: '<h1>Test Article</h1><p>This is a test.</p>',
      tags: ['javascript', 'web-development']
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
    
    // Check user info request
    expect(mockFetch).toHaveBeenNthCalledWith(1,
      'https://api.medium.com/v1/me',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test_medium_token' }
      })
    )

    // Check post creation request
    expect(mockFetch).toHaveBeenNthCalledWith(2,
      'https://api.medium.com/v1/users/user123/posts',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer test_medium_token'
        },
        body: JSON.stringify({
          title: 'Test Medium Article',
          contentFormat: 'html',
          content: '<h1>Test Article</h1><p>This is a test.</p>',
          tags: ['javascript', 'web-development'],
          publishStatus: 'public',
          notifyFollowers: false
        })
      })
    )

    expect(result.url).toBe('https://medium.com/@user/post-456')
    expect(result.id).toBe('post456')
  })

  it('应该使用默认标签', async () => {
    const mockUserResponse = { data: { id: 'user123' } }
    const mockPostResponse = { data: { id: 'post789', url: 'https://medium.com/@user/post-789' } }

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUserResponse) } as Response)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPostResponse) } as Response)

    await publishMedium({
      title: 'Article Without Tags',
      html: '<p>Content</p>'
    })

    const requestBody = JSON.parse(mockFetch.mock.calls[1][1]?.body as string)
    expect(requestBody.tags).toEqual(['github', 'trending'])
  })

  it('应该处理用户信息获取失败', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    } as Response)

    await expect(publishMedium({
      title: 'Test',
      html: '<p>Test</p>'
    })).rejects.toThrow('medium /me')
  })

  it('应该处理文章发布失败', async () => {
    const mockUserResponse = { data: { id: 'user123' } }

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockUserResponse) } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad Request' }),
      } as Response)

    await expect(publishMedium({
      title: 'Invalid Article',
      html: ''
    })).rejects.toThrow('medium')
  })
})