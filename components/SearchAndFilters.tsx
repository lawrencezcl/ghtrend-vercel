'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArticleFilters } from '@/lib/articles-fixed'

interface SearchAndFiltersProps {
  filters: ArticleFilters
  languages: { language: string; count: number }[]
}

export function SearchAndFilters({ filters, languages }: SearchAndFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(filters.search || '')

  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    
    // 重置页数
    if (Object.keys(newFilters).some(key => key !== 'page')) {
      params.delete('page')
    }
    
    router.push(`/articles?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchValue })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 搜索框 */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索文章标题或摘要..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </form>
        </div>

        {/* 语言筛选 */}
        <div>
          <select
            value={filters.language || ''}
            onChange={(e) => updateFilters({ language: e.target.value })}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">所有语言</option>
            {languages.map((lang) => (
              <option key={lang.language} value={lang.language}>
                {lang.language} ({lang.count})
              </option>
            ))}
          </select>
        </div>

        {/* 排序 */}
        <div>
          <select
            value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              updateFilters({ 
                sortBy: sortBy as 'created_at' | 'updated_at' | 'stars', 
                sortOrder: sortOrder as 'asc' | 'desc' 
              })
            }}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at-desc">最新发布</option>
            <option value="created_at-asc">最早发布</option>
            <option value="updated_at-desc">最近更新</option>
            <option value="stars-desc">⭐ 最多</option>
            <option value="stars-asc">⭐ 最少</option>
          </select>
        </div>
      </div>

      {/* 快速清除筛选 */}
      {(filters.search || filters.language) && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">当前筛选:</span>
          {filters.search && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              搜索: {filters.search}
              <button
                onClick={() => {
                  setSearchValue('')
                  updateFilters({ search: '' })
                }}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.language && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              语言: {filters.language}
              <button
                onClick={() => updateFilters({ language: '' })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchValue('')
              updateFilters({ search: '', language: '' })
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  )
}