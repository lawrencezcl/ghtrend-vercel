import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface ArticlePageProps {
  params: {
    id: string
  }
}

// 模拟文章数据
const mockArticles = {
  'article-1': {
    id: 'article-1',
    repo_id: 'microsoft/typescript',
    title_cn: 'TypeScript：为JavaScript带来强类型',
    title_en: 'TypeScript: Bringing Strong Typing to JavaScript',
    summary_cn: 'TypeScript作为JavaScript的超集，为大型项目开发提供了类型安全保障。',
    body_cn_md: `# TypeScript：为JavaScript带来强类型

TypeScript是微软开发的开源编程语言，它是JavaScript的超集，为JavaScript添加了可选的静态类型定义。

## 主要特性

### 静态类型检查
TypeScript在编译时进行类型检查，可以提前发现潜在的错误：

\`\`\`typescript
function greet(name: string): string {
  return "Hello, " + name;
}

// 编译时错误
greet(123); // Argument of type 'number' is not assignable to parameter of type 'string'
\`\`\`

### 现代JavaScript支持
TypeScript支持最新的ECMAScript特性，并可以编译到旧版本的JavaScript：

- ES6+ 语法支持
- 装饰器（Decorators）
- 模块化导入导出
- 异步/等待（async/await）

### 强大的开发工具
- 智能代码补全
- 重构支持
- 导航和搜索
- 实时错误检测

## 为什么选择TypeScript？

1. **类型安全**：减少运行时错误
2. **更好的IDE支持**：智能提示和重构
3. **大型项目友好**：更好的代码组织和维护
4. **渐进式采用**：可以逐步从JavaScript迁移

TypeScript已经成为现代前端开发的标准选择，被广泛应用于React、Vue、Angular等框架的开发中。`,
    lang: 'TypeScript',
    stars_total: 98123,
    topics: ['typescript', 'javascript', 'compiler'],
    homepage: 'https://www.typescriptlang.org',
    license: 'Apache-2.0',
    created_at: '2025-09-24T00:00:00Z',
    updated_at: '2025-09-24T00:00:00Z'
  },
  'article-2': {
    id: 'article-2',
    repo_id: 'facebook/react',
    title_cn: 'React：构建用户界面的JavaScript库',
    title_en: 'React: A JavaScript Library for Building User Interfaces',
    summary_cn: 'React通过组件化和虚拟DOM革命性地改变了前端开发方式。',
    body_cn_md: `# React：构建用户界面的JavaScript库

React是Facebook开发的开源JavaScript库，用于构建用户界面，特别是单页应用程序。

## 核心概念

### 组件化开发
React将UI分解为独立、可复用的组件：

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="张三" />
      <Welcome name="李四" />
    </div>
  );
}
\`\`\`

### 虚拟DOM
React使用虚拟DOM来优化渲染性能：

- 在内存中维护虚拟DOM树
- 通过diff算法找出变化
- 只更新需要改变的真实DOM节点

### 单向数据流
React采用单向数据流，使应用状态更可预测：

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
\`\`\`

## React生态系统

- **React Router**：客户端路由
- **Redux/Context API**：状态管理
- **React Native**：移动应用开发
- **Next.js**：全栈React框架

React已经成为最受欢迎的前端框架之一，拥有庞大的社区和丰富的生态系统。`,
    lang: 'JavaScript',
    stars_total: 225489,
    topics: ['react', 'javascript', 'library'],
    homepage: 'https://reactjs.org',
    license: 'MIT',
    created_at: '2025-09-23T00:00:00Z',
    updated_at: '2025-09-23T00:00:00Z'
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = mockArticles[params.id as keyof typeof mockArticles]
  
  if (!article) {
    return {
      title: '文章未找到'
    }
  }

  const title = article.title_cn || article.title_en || '未命名文章'
  const description = article.summary_cn || '暂无摘要'

  return {
    title: `${title} | GitHub Trending 精选`,
    description,
    keywords: `GitHub, ${article.lang}, 开源项目, ${article.topics?.join(', ')}`,
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = mockArticles[params.id as keyof typeof mockArticles]
  
  if (!article) {
    notFound()
  }

  const title = article.title_cn || article.title_en || '未命名文章'
  const content = article.body_cn_md || ''
  const summary = article.summary_cn || ''

  return (
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

          {/* 发布时间 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              发布于 {new Date(article.created_at).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </header>

        {/* 文章内容 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
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
  )
}