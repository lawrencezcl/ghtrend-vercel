'use client'

import { useMemo } from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    // 简单的Markdown到HTML转换
    // 在生产环境中，建议使用 react-markdown 或 marked 等专业库
    let html = content
      // 标题
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-6">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mt-12 mb-8">$1</h1>')
      // 粗体
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
      // 斜体
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      // 代码块
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto my-6"><code class="text-sm">$1</code></pre>')
      // 行内代码
      .replace(/`([^`]*)`/gim, '<code class="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm">$1</code>')
      // 链接
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // 无序列表
      .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      // 有序列表
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-2 list-decimal">$1</li>')
      // 段落
      .replace(/\n\n/gim, '</p><p class="mb-4 text-gray-700 leading-relaxed">')

    // 包装在段落标签中
    html = '<p class="mb-4 text-gray-700 leading-relaxed">' + html + '</p>'
    
    // 清理空段落
    html = html.replace(/<p class="mb-4 text-gray-700 leading-relaxed"><\/p>/gim, '')
    
    return html
  }, [content])

  if (!content) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>暂无内容</p>
      </div>
    )
  }

  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}