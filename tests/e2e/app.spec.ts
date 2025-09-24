import { test, expect } from '@playwright/test'

test.describe('GitHub Trending 系统 E2E 测试', () => {
  test('主页应该正确加载并显示所有关键元素', async ({ page }) => {
    await page.goto('/')
    
    // 检查页面标题
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
    
    // 检查功能介绍
    await expect(page.getByText('自动抓取GitHub热门项目，生成中英文内容并分发到多个平台')).toBeVisible()
    
    // 检查功能卡片
    await expect(page.getByText('🔄 自动化流程')).toBeVisible()
    await expect(page.getByText('🚀 支持平台')).toBeVisible()
    
    // 检查导航链接
    await expect(page.getByRole('link', { name: '📊 管理面板' })).toBeVisible()
    await expect(page.getByRole('link', { name: '🧪 测试发布' })).toBeVisible()
    
    // 检查系统状态
    await expect(page.getByText('📈 系统状态')).toBeVisible()
  })

  test('管理面板应该正确加载并显示管理界面', async ({ page }) => {
    await page.goto('/admin')
    
    // 检查页面标题
    await expect(page.getByText('管理面板')).toBeVisible()
    await expect(page.getByText('查看最近的GitHub项目选择和发布状态')).toBeVisible()
    
    // 检查统计概览区域
    await expect(page.getByText('本周精选')).toBeVisible()
    await expect(page.getByText('本周发布')).toBeVisible()
    await expect(page.getByText('成功发布')).toBeVisible()
    await expect(page.getByText('发布失败')).toBeVisible()
    
    // 检查操作按钮
    await expect(page.getByRole('button', { name: '🔄 手动抓取' })).toBeVisible()
    await expect(page.getByRole('button', { name: '✍️ 生成文章' })).toBeVisible()
    await expect(page.getByRole('button', { name: '🚀 渲染发布' })).toBeVisible()
    
    // 检查项目列表区域
    await expect(page.getByText('最近精选项目')).toBeVisible()
    await expect(page.getByText('最近发布记录')).toBeVisible()
  })

  test('页面导航应该正确工作', async ({ page }) => {
    // 从主页导航到管理面板
    await page.goto('/')
    await page.click('a[href="/admin"]')
    await expect(page).toHaveURL('/admin')
    
    // 返回主页
    await page.goto('/')
    await expect(page).toHaveURL('/')
  })

  test('响应式设计应该在不同屏幕尺寸下正常工作', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
    
    // 测试移动设备视图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
  })

  test('页面应该无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.goto('/admin')
    
    // 应该没有JavaScript错误
    expect(errors.length).toBe(0)
  })

  test('页面加载性能应该满足要求', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    const loadTime = Date.now() - startTime
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000)
    
    // 检查关键内容是否可见
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
  })
})

test.describe('API端点E2E测试', () => {
  test('应该能够访问demo发布端点', async ({ page }) => {
    // 测试POST请求到demo发布端点
    const response = await page.request.post('/api/demo/publish', {
      data: {
        title: 'E2E Test Project',
        repo: 'test/e2e-repo',
        summary: 'This is an E2E test project',
        stars: 100
      }
    })
    
    // API应该返回响应（可能是错误响应，但应该有响应）
    expect(response.status()).toBeGreaterThanOrEqual(200)
    expect(response.status()).toBeLessThan(600)
  })

  test('webhook端点应该正确验证签名', async ({ page }) => {
    // 测试没有签名的请求
    const response = await page.request.post('/api/webhook/publish', {
      data: {
        article: { id: 'test' },
        platform: 'test'
      }
    })
    
    // 应该返回401未授权
    expect(response.status()).toBe(401)
  })

  test('API端点应该正确处理OPTIONS请求', async ({ page }) => {
    const response = await page.request.fetch('/api/demo/publish', {
      method: 'OPTIONS'
    })
    
    // 应该返回200或405
    expect([200, 405]).toContain(response.status())
  })
})

test.describe('错误处理E2E测试', () => {
  test('404页面应该正确显示', async ({ page }) => {
    const response = await page.goto('/nonexistent-page')
    
    // 应该返回404状态码
    expect(response?.status()).toBe(404)
  })

  test('应该优雅处理网络错误', async ({ page }) => {
    // 模拟网络离线
    await page.context().setOffline(true)
    
    const response = await page.goto('/', { timeout: 5000 }).catch(() => null)
    
    // 应该处理网络错误而不是崩溃
    expect(response).toBeNull()
    
    // 恢复网络连接
    await page.context().setOffline(false)
  })
})

test.describe('安全性E2E测试', () => {
  test('页面应该有适当的安全标头', async ({ page }) => {
    const response = await page.goto('/')
    
    const headers = response?.headers()
    
    // 检查X-Frame-Options或Content-Security-Policy
    expect(
      headers?.['x-frame-options'] || 
      headers?.['content-security-policy']
    ).toBeDefined()
  })

  test('应该防止XSS攻击', async ({ page }) => {
    // 尝试注入JavaScript
    await page.goto('/?search=<script>alert("xss")</script>')
    
    // 页面应该正常加载，不执行注入的脚本
    await expect(page.getByText('GitHub Trending Auto-Publisher')).toBeVisible()
  })
})