import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('主页面组件', () => {
  it('应该渲染项目标题和描述', () => {
    render(<HomePage />)
    
    expect(screen.getByText('GitHub Trending Auto-Publisher')).toBeInTheDocument()
    expect(screen.getByText(/自动抓取GitHub热门项目/)).toBeInTheDocument()
  })

  it('应该显示自动化流程功能卡片', () => {
    render(<HomePage />)
    
    expect(screen.getByText('🔄 自动化流程')).toBeInTheDocument()
    expect(screen.getByText(/每日抓取 GitHub Trending/)).toBeInTheDocument()
    expect(screen.getByText(/AI生成中英文文章/)).toBeInTheDocument()
    expect(screen.getByText(/自动渲染分享卡片/)).toBeInTheDocument()
    expect(screen.getByText(/多平台同步发布/)).toBeInTheDocument()
  })

  it('应该显示支持平台功能卡片', () => {
    render(<HomePage />)
    
    expect(screen.getByText('🚀 支持平台')).toBeInTheDocument()
    expect(screen.getByText(/Telegram 频道/)).toBeInTheDocument()
    expect(screen.getByText(/DEV.to 社区/)).toBeInTheDocument()
    expect(screen.getByText(/Medium 博客/)).toBeInTheDocument()
    expect(screen.getByText(/国内平台\(RPA\)/)).toBeInTheDocument()
  })

  it('应该显示导航链接', () => {
    render(<HomePage />)
    
    const adminLink = screen.getByRole('link', { name: /📊 管理面板/ })
    const demoLink = screen.getByRole('link', { name: /🧪 测试发布/ })
    
    expect(adminLink).toBeInTheDocument()
    expect(adminLink).toHaveAttribute('href', '/admin')
    
    expect(demoLink).toBeInTheDocument()
    expect(demoLink).toHaveAttribute('href', '/api/demo/publish')
  })

  it('应该显示系统状态指标', () => {
    render(<HomePage />)
    
    expect(screen.getByText('📈 系统状态')).toBeInTheDocument()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('抓取频率')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
    expect(screen.getByText('发布模式')).toBeInTheDocument()
    expect(screen.getByText('Multi')).toBeInTheDocument()
    expect(screen.getByText('平台支持')).toBeInTheDocument()
  })

  it('应该应用正确的CSS类名', () => {
    render(<HomePage />)
    
    const container = screen.getByText('GitHub Trending Auto-Publisher').closest('div')
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'py-8')
  })
})