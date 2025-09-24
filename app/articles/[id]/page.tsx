import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleById } from '@/lib/articles-fixed'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { ShareButtons } from '@/components/ShareButtons'

interface ArticlePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleById(params.id)
  
  if (!article) {
    return {
      title: '文章未找到'
    }
  }

  const title = article.title_cn || article.title_en || '未命名文章'
  const description = article.summary_cn || article.summary_en || '暂无摘要'
  const url = `/articles/${article.id}`

  return {
    title: `${title} | GitHub Trending 精选`,
    description,
    keywords: `GitHub, ${article.lang}, 开源项目, ${article.topics?.join(', ')}`,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: ['GitHub Trending Auto-Publisher'],
      tags: article.topics || []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical: url
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleById(params.id)
  
  if (!article) {
    notFound()
  }

  const title = article.title_cn || article.title_en || '未命名文章'
  const content = article.body_cn_md || article.body_en_md || ''
  const summary = article.summary_cn || article.summary_en || ''

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": summary,
    "url": `${process.env.VERCEL_URL || 'https://ghtrend-vercel.vercel.app'}/articles/${article.id}`,
    "datePublished": article.created_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": "GitHub Trending Auto-Publisher"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GitHub Trending Auto-Publisher"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.VERCEL_URL || 'https://ghtrend-vercel.vercel.app'}/articles/${article.id}`
    },
    "keywords": article.topics?.join(', '),
    "about": {
      "@type": "SoftwareSourceCode",
      "name": article.repo_id,
      "programmingLanguage": article.lang,
      "url": `https://github.com/${article.repo_id}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <article className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/articles" className="hover:text-blue-600 transition-colors">
              文章列表
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900">{title}</span>
          </nav>

          {/* 文章头部 */}
          <header className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {title}
            </h1>
            
            {summary && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {summary}
              </p>
            )}

            {/* 项目信息 */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link 
                href={`https://github.com/${article.repo_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                查看项目
              </Link>

              {article.homepage && (
                <Link 
                  href={article.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  官方网站
                </Link>
              )}
            </div>

            {/* 标签和统计 */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {article.lang && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  {article.lang}
                </span>
              )}
              {article.stars_total && article.stars_total > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {article.stars_total.toLocaleString()} Stars
                </span>
              )}
              {article.license && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  {article.license}
                </span>
              )}
              {article.topics && article.topics.map((topic) => (
                <span key={topic} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {topic}
                </span>
              ))}
            </div>

            {/* 发布时间和分享 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                发布于 {new Date(article.created_at).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                {article.updated_at !== article.created_at && (
                  <span className="ml-4">
                    更新于 {new Date(article.updated_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                )}
              </div>
              <ShareButtons 
                title={title}
                url={`${process.env.VERCEL_URL || 'https://ghtrend-vercel.vercel.app'}/articles/${article.id}`}
              />
            </div>
          </header>

          {/* 文章内容 */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <MarkdownRenderer content={content} />
            </div>
          </div>

          {/* 返回列表 */}
          <div className="text-center">
            <Link 
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回文章列表
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}