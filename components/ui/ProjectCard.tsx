import React from 'react'

interface ProjectCardProps {
  repoId: string
  title?: string
  description?: string
  stars: number
  score?: number
  topics?: string[]
  status: 'draft' | 'generated' | 'ready' | 'published' | 'failed'
  date: string
  onViewRepo?: () => void
  onRetry?: () => void
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  generated: 'bg-blue-100 text-blue-800',
  ready: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const statusLabels = {
  draft: '草稿',
  generated: '已生成',
  ready: '准备发布',
  published: '已发布',
  failed: '发布失败'
}

export function ProjectCard({
  repoId,
  title,
  description,
  stars,
  score,
  topics = [],
  status,
  date,
  onViewRepo,
  onRetry
}: ProjectCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">
            <button
              onClick={onViewRepo}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {repoId}
            </button>
          </h3>
          
          {title && (
            <p className="text-sm text-gray-600 mb-2">{title}</p>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              ⭐ {stars.toLocaleString()}
            </span>
            {score && (
              <span className="flex items-center">
                📊 {score.toFixed(1)}
              </span>
            )}
            <span>📅 {date}</span>
          </div>
          
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {topic}
                </span>
              ))}
              {topics.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded">
                  +{topics.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex flex-col items-end gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
          
          {status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
            >
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  )
}