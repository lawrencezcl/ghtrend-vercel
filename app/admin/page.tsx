import { getPool } from '@/lib/db-connection'

async function getRecentPicks() {
  const pool = getPool()
  if (!pool) {
    return []
  }
  
  try {
    const client = await pool.connect()
    try {
      const { rows } = await client.query(`
        SELECT p.*, r.stars_total, r.topics, a.title_en, a.title_cn, a.status as article_status
        FROM picks p 
        JOIN repos r ON p.repo_id = r.id 
        LEFT JOIN articles a ON a.repo_id = p.repo_id
        WHERE p.date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY p.date DESC, p.score DESC 
        LIMIT 50
      `)
      return rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to fetch recent picks:', error)
    return []
  }
}

async function getRecentPublishes() {
  const pool = getPool()
  if (!pool) {
    return []
  }
  
  try {
    const client = await pool.connect()
    try {
      const { rows } = await client.query(`
        SELECT pub.*, a.title_en, a.title_cn, a.repo_id
        FROM publishes pub
        JOIN articles a ON pub.article_id = a.id
        WHERE pub.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY pub.created_at DESC
        LIMIT 100
      `)
      return rows
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Failed to fetch recent publishes:', error)
    return []
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'generated': return 'bg-blue-100 text-blue-800'
    case 'ready': return 'bg-yellow-100 text-yellow-800'
    case 'published': return 'bg-green-100 text-green-800'
    case 'sent': return 'bg-green-100 text-green-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'queued': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function AdminPage() {
  const picks = await getRecentPicks()
  const publishes = await getRecentPublishes()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理面板</h1>
          <p className="text-gray-600">查看最近的GitHub项目选择和发布状态</p>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">本周精选</h3>
            <p className="text-2xl font-bold text-blue-600">{picks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">本周发布</h3>
            <p className="text-2xl font-bold text-green-600">{publishes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">成功发布</h3>
            <p className="text-2xl font-bold text-green-600">
              {publishes.filter(p => p.status === 'sent').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">发布失败</h3>
            <p className="text-2xl font-bold text-red-600">
              {publishes.filter(p => p.status === 'failed').length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 最近精选项目 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">最近精选项目</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {picks.map((pick: any) => (
                <div key={pick.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        <a 
                          href={`https://github.com/${pick.repo_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {pick.repo_id}
                        </a>
                      </h3>
                      {pick.title_en && (
                        <p className="text-sm text-gray-600 mt-1">{pick.title_en}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>⭐ {pick.stars_total?.toLocaleString()}</span>
                        <span>📊 {pick.score?.toFixed(1)}</span>
                        <span>📅 {pick.date}</span>
                      </div>
                      {pick.topics && pick.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {pick.topics.slice(0, 3).map((topic: string) => (
                            <span key={topic} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pick.article_status || 'draft')}`}>
                        {pick.article_status || 'draft'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近发布记录 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">最近发布记录</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {publishes.map((pub: any) => (
                <div key={pub.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        <a 
                          href={`https://github.com/${pub.repo_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {pub.repo_id}
                        </a>
                      </h3>
                      {(pub.title_en || pub.title_cn) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {pub.title_en || pub.title_cn}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="font-medium">{pub.platform}</span>
                        <span>{formatDate(pub.created_at)}</span>
                        {pub.retries > 0 && (
                          <span className="text-orange-600">重试 {pub.retries}次</span>
                        )}
                      </div>
                      {pub.post_url && (
                        <a 
                          href={pub.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-1 block"
                        >
                          查看发布内容 →
                        </a>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pub.status)}`}>
                        {pub.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-8 flex gap-4">
          <a 
            href="/api/cron/fetch"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
          >
            🔄 手动抓取
          </a>
          <a 
            href="/api/cron/generate"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block text-center"
          >
            ✍️ 生成文章
          </a>
          <a 
            href="/api/cron/render-publish"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block text-center"
          >
            🚀 渲染发布
          </a>
        </div>
      </div>
    </div>
  )
}