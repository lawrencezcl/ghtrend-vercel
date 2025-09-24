import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db-connection'

export async function GET() {
  try {
    // 检查数据库连接
    const pool = getPool()
    if (!pool) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection not available',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // 测试数据库查询
    const client = await pool.connect()
    try {
      await client.query('SELECT 1')
      
      // 获取基本统计信息
      const { rows: [repoCount] } = await client.query('SELECT COUNT(*) as count FROM repos')
      const { rows: [articleCount] } = await client.query('SELECT COUNT(*) as count FROM articles WHERE status = $1', ['published'])
      const { rows: [pickCount] } = await client.query('SELECT COUNT(*) as count FROM picks WHERE date >= CURRENT_DATE - INTERVAL \'7 days\'')
      
      return NextResponse.json({
        status: 'healthy',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
        data: {
          database: 'connected',
          stats: {
            repositories: parseInt(repoCount.count),
            articles: parseInt(articleCount.count),
            recentPicks: parseInt(pickCount.count)
          }
        }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}