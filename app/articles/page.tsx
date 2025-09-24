import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getArticles, getArticlesCount, getLanguages, ArticleFilters } from '@/lib/articles-fixed'
import { ArticleCard } from '@/components/ArticleCard'
import { SearchAndFilters } from '@/components/SearchAndFilters'
import { Pagination } from '@/components/Pagination'

export const metadata: Metadata = {
  title: 'GitHub Trending 精选文章 | 发现最新技术趋势',
  description: '探索GitHub上最受欢迎的开源项目，获取最新的技术趋势和深度分析文章。涵盖JavaScript、Python、TypeScript等多种编程语言。',
  keywords: 'GitHub, Trending, 开源项目, 技术文章, JavaScript, Python, TypeScript, 编程, 开发者',
  openGraph: {
    title: 'GitHub Trending 精选文章',
    description: '探索GitHub上最受欢迎的开源项目，获取最新的技术趋势和深度分析文章',
    type: 'website',
    url: '/articles',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Trending 精选文章',
    description: '探索GitHub上最受欢迎的开源项目，获取最新的技术趋势和深度分析文章',
  },
  alternates: {
    canonical: '/articles'
  }
}

interface ArticlesPageProps {
  searchParams: {
    search?: string
    status?: string
    language?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const filters: ArticleFilters = {
    search: searchParams.search || '',
    status: searchParams.status || 'published',
    language: searchParams.language || '',
    sortBy: (searchParams.sortBy as 'created_at' | 'updated_at' | 'stars') || 'created_at',
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.page || '1'),
    limit: 12
  }

  const [articles, totalCount, languages] = await Promise.all([
    getArticles(filters),
    getArticlesCount(filters),
    getLanguages()
  ])

  const totalPages = Math.ceil(totalCount / filters.limit!)
  const currentPage = filters.page!

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "GitHub Trending 精选文章",
    "description": "探索GitHub上最受欢迎的开源项目，获取最新的技术趋势和深度分析文章",
    "url": `${process.env.VERCEL_URL || 'https://ghtrend-vercel.vercel.app'}/articles`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalCount,
      "itemListElement": articles.map((article, index) => ({
        "@type": "Article",
        "position": index + 1,
        "headline": article.title_cn || article.title_en,
        "description": article.summary_cn || article.summary_en,
        "url": `/articles/${article.id}`,
        "datePublished": article.created_at,
        "dateModified": article.updated_at,
        "author": {
          "@type": "Organization",
          "name": "GitHub Trending Auto-Publisher"
        }
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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

          {/* 搜索和筛选 */}
          <Suspense fallback={<div className="mb-8 h-16 bg-white rounded-lg animate-pulse" />}>
            <SearchAndFilters 
              filters={filters}
              languages={languages}
            />
          </Suspense>

          {/* 文章统计 */}
          <div className="mb-6">
            <p className="text-gray-600">
              找到 <span className="font-semibold text-blue-600">{totalCount}</span> 篇文章
              {filters.search && (
                <span> 包含 "<span className="font-semibold">{filters.search}</span>"</span>
              )}
              {filters.language && (
                <span> 语言: <span className="font-semibold">{filters.language}</span></span>
              )}
            </p>
          </div>

          {/* 文章列表 */}
          <Suspense fallback={<ArticlesSkeleton />}>
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
                <p className="text-gray-500 mb-4">
                  {filters.search || filters.language 
                    ? '尝试调整搜索条件或筛选器' 
                    : '还没有发布的文章，请稍后再来查看'}
                </p>
                {(filters.search || filters.language) && (
                  <Link 
                    href="/articles"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    查看所有文章
                  </Link>
                )}
              </div>
            )}
          </Suspense>

          {/* 分页 */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/articles"
              searchParams={searchParams}
            />
          )}
        </div>
      </div>
    </>
  )
}

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-4"></div>
          <div className="flex space-x-2 mb-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}