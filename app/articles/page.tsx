import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GitHub Trending 精选文章 | 发现最新技术趋势',
  description: '探索GitHub上最受欢迎的开源项目，获取最新的技术趋势和深度分析文章。涵盖JavaScript、Python、TypeScript等多种编程语言。',
  keywords: 'GitHub, Trending, 开源项目, 技术文章, JavaScript, Python, TypeScript, 编程, 开发者',
}

export default function ArticlesPage() {
  // 临时使用静态数据，避免构建时数据库连接问题
  const mockArticles = [
    {
      id: 'article-1',
      title_cn: 'TypeScript：为JavaScript带来强类型',
      title_en: 'TypeScript: Bringing Strong Typing to JavaScript',
      summary_cn: 'TypeScript作为JavaScript的超集，为大型项目开发提供了类型安全保障。',
      lang: 'TypeScript',
      stars_total: 98123,
      created_at: '2025-09-24T00:00:00Z'
    },
    {
      id: 'article-2',
      title_cn: 'React：构建用户界面的JavaScript库',
      title_en: 'React: A JavaScript Library for Building User Interfaces',
      summary_cn: 'React通过组件化和虚拟DOM革命性地改变了前端开发方式。',
      lang: 'JavaScript',
      stars_total: 225489,
      created_at: '2025-09-23T00:00:00Z'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            GitHub Trending 精选文章
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            发现GitHub上最受关注的开源项目，深入了解最新技术趋势。
            我们精选并分析热门项目，为开发者提供有价值的技术洞察。
          </p>
        </div>

        {/* 状态提示 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800">
              数据库连接正在配置中，当前显示示例文章。完整功能即将上线！
            </span>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockArticles.map((article) => (
            <Link href={`/articles/${article.id}`} key={article.id} className="block group">
              <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 h-full">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title_cn}
                </h2>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.summary_cn}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {article.lang}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {article.stars_total.toLocaleString()}
                  </span>
                </div>
                
                <div className="text-xs text-gray-400">
                  {new Date(article.created_at).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  阅读全文
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 返回主页 */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}