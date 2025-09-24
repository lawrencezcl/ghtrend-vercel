'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  const params = useSearchParams()
  
  const createPageUrl = (page: number) => {
    const newParams = new URLSearchParams(params.toString())
    newParams.set('page', page.toString())
    return `${baseUrl}?${newParams.toString()}`
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6" aria-label="分页导航">
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          显示第 <span className="font-medium">{(currentPage - 1) * 12 + 1}</span> 到{' '}
          <span className="font-medium">{Math.min(currentPage * 12, totalPages * 12)}</span> 页，
          共 <span className="font-medium">{totalPages}</span> 页
        </p>
      </div>
      
      <div className="flex flex-1 justify-between sm:justify-end">
        {/* 上一页 */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            上一页
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-md cursor-not-allowed">
            上一页
          </span>
        )}

        {/* 页码 */}
        <div className="hidden md:flex">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                >
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isCurrentPage = pageNum === currentPage

            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  isCurrentPage
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </Link>
            )
          })}
        </div>

        {/* 下一页 */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            下一页
          </Link>
        ) : (
          <span className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-300 rounded-md cursor-not-allowed">
            下一页
          </span>
        )}
      </div>
    </nav>
  )
}