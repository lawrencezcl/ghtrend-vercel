import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export interface Article {
  id: string
  repo_id: string
  title_cn: string
  title_en: string
  summary_cn: string
  summary_en: string
  body_cn_md: string
  body_en_md: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
  repo?: {
    id: string
    lang: string
    stars_total: number
    stars_7d: number
    topics: string[]
    homepage?: string
    license?: string
  }
  publishes?: {
    platform: string
    post_url?: string
    status: string
  }[]
}

export interface ArticleFilters {
  search?: string
  status?: string
  language?: string
  sortBy?: 'created_at' | 'updated_at' | 'stars'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface ArticleRow {
  id: string
  repo_id: string
  title_cn: string
  title_en: string
  summary_cn: string
  summary_en: string
  body_cn_md: string
  body_en_md: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
  lang: string
  stars_total: number
  stars_7d: number
  topics: string[]
  homepage?: string
  license?: string
  publishes: any[]
}

export async function getArticles(filters: ArticleFilters = {}) {
  const {
    search = '',
    status = 'published',
    language = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = filters

  const offset = (page - 1) * limit
  
  let whereClause = `WHERE a.status = $1`
  let params: any[] = [status]
  let paramIndex = 2

  // 搜索功能
  if (search) {
    whereClause += ` AND (a.title_cn ILIKE $${paramIndex} OR a.title_en ILIKE $${paramIndex} OR a.summary_cn ILIKE $${paramIndex} OR a.summary_en ILIKE $${paramIndex})`
    params.push(`%${search}%`)
    paramIndex++
  }

  // 语言筛选
  if (language) {
    whereClause += ` AND r.lang = $${paramIndex}`
    params.push(language)
    paramIndex++
  }

  // 排序
  let orderClause = ''
  switch (sortBy) {
    case 'stars':
      orderClause = `ORDER BY r.stars_total ${sortOrder.toUpperCase()}`
      break
    case 'updated_at':
      orderClause = `ORDER BY a.updated_at ${sortOrder.toUpperCase()}`
      break
    case 'created_at':
    default:
      orderClause = `ORDER BY a.created_at ${sortOrder.toUpperCase()}`
      break
  }

  const query = `
    SELECT 
      a.*,
      r.lang,
      r.stars_total,
      r.stars_7d,
      r.topics,
      r.homepage,
      r.license,
      json_agg(
        json_build_object(
          'platform', p.platform,
          'post_url', p.post_url,
          'status', p.status
        )
      ) FILTER (WHERE p.id IS NOT NULL) as publishes
    FROM articles a
    LEFT JOIN repos r ON a.repo_id = r.id
    LEFT JOIN publishes p ON a.id = p.article_id
    ${whereClause}
    GROUP BY a.id, r.lang, r.stars_total, r.stars_7d, r.topics, r.homepage, r.license
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `

  params.push(limit, offset)

  const client = await pool.connect()
  try {
    const { rows } = await client.query(query, params)
    
    return rows.map((row: ArticleRow) => ({
      ...row,
      repo: {
        id: row.repo_id,
        lang: row.lang,
        stars_total: row.stars_total,
        stars_7d: row.stars_7d,
        topics: row.topics || [],
        homepage: row.homepage,
        license: row.license
      },
      publishes: row.publishes || []
    })) as Article[]
  } finally {
    client.release()
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`
      SELECT 
        a.*,
        r.lang,
        r.stars_total,
        r.stars_7d,
        r.topics,
        r.homepage,
        r.license,
        json_agg(
          json_build_object(
            'platform', p.platform,
            'post_url', p.post_url,
            'status', p.status
          )
        ) FILTER (WHERE p.id IS NOT NULL) as publishes
      FROM articles a
      LEFT JOIN repos r ON a.repo_id = r.id
      LEFT JOIN publishes p ON a.id = p.article_id
      WHERE a.id = $1
      GROUP BY a.id, r.lang, r.stars_total, r.stars_7d, r.topics, r.homepage, r.license
    `, [id])

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      ...row,
      repo: {
        id: row.repo_id,
        lang: row.lang,
        stars_total: row.stars_total,
        stars_7d: row.stars_7d,
        topics: row.topics || [],
        homepage: row.homepage,
        license: row.license
      },
      publishes: row.publishes || []
    } as Article
  } finally {
    client.release()
  }
}

export async function getArticlesCount(filters: ArticleFilters = {}) {
  const {
    search = '',
    status = 'published',
    language = ''
  } = filters

  let whereClause = `WHERE a.status = $1`
  let params: any[] = [status]
  let paramIndex = 2

  if (search) {
    whereClause += ` AND (a.title_cn ILIKE $${paramIndex} OR a.title_en ILIKE $${paramIndex} OR a.summary_cn ILIKE $${paramIndex} OR a.summary_en ILIKE $${paramIndex})`
    params.push(`%${search}%`)
    paramIndex++
  }

  if (language) {
    whereClause += ` AND r.lang = $${paramIndex}`
    params.push(language)
    paramIndex++
  }

  const query = `
    SELECT COUNT(*) as count
    FROM articles a
    LEFT JOIN repos r ON a.repo_id = r.id
    ${whereClause}
  `

  const client = await pool.connect()
  try {
    const { rows } = await client.query(query, params)
    return parseInt(rows[0].count)
  } finally {
    client.release()
  }
}

export async function getLanguages() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`
      SELECT DISTINCT r.lang as language, COUNT(*) as count
      FROM articles a
      LEFT JOIN repos r ON a.repo_id = r.id
      WHERE a.status = 'published' AND r.lang IS NOT NULL
      GROUP BY r.lang
      ORDER BY count DESC
    `)
    return rows
  } finally {
    client.release()
  }
}

export async function getPopularTags() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query(`
      SELECT 
        unnest(r.topics) as tag,
        COUNT(*) as count
      FROM articles a
      LEFT JOIN repos r ON a.repo_id = r.id
      WHERE a.status = 'published' AND r.topics IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `)
    return rows
  } finally {
    client.release()
  }
}