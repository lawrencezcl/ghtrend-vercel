import Link from 'next/link'
import { Article } from '@/lib/articles-simple'

interface ArticleCardProps {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const title = article.title_cn || article.title_en || '未命名文章'
  const summary = article.summary_cn || article.summary_en || '暂无摘要'
  
  return (
    <Link href={`/articles/${article.id}`} className="block group">
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 h-full">
        {/* 标题 */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h2>
        
        {/* 摘要 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {summary}
        </p>
        
        {/* 元信息 */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {article.lang && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {article.lang}
            </span>
          )}
          {article.stars_total && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {article.stars_total.toLocaleString()}
            </span>
          )}
          {article.topics && article.topics.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {article.topics[0]}
            </span>
          )}
        </div>
        
        {/* 发布时间 */}
        <div className="text-xs text-gray-400">
          {new Date(article.created_at).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        
        {/* 阅读更多箭头 */}
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
          阅读全文
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  )
}