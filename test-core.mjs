#!/usr/bin/env node

// 简单的测试脚本，验证核心功能是否正常工作
import { fetchTrending } from './lib/trending.ts'
import { enrichRepo } from './lib/github.ts'
import { scoreRepo } from './lib/score.ts'
import { composeArticle } from './lib/generate.ts'
import { renderCardSVG } from './lib/satori.tsx'

async function testCore() {
  console.log('🧪 开始测试核心功能...\n')
  
  try {
    // 测试1: 抓取trending
    console.log('1️⃣ 测试GitHub Trending抓取...')
    const trending = await fetchTrending('typescript', 'daily')
    console.log(`✅ 抓取到 ${trending.length} 个TypeScript项目`)
    if (trending.length > 0) {
      console.log(`   示例: ${trending[0].full_name} (位置: ${trending[0].position})`)
    }
    
    if (trending.length === 0) {
      console.log('⚠️  没有抓取到项目，可能是GitHub页面结构变化')
      return
    }
    
    // 测试2: 富化项目信息
    console.log('\n2️⃣ 测试GitHub API富化...')
    const testRepo = trending[0]
    const meta = await enrichRepo(testRepo.full_name)
    console.log(`✅ 富化项目: ${meta.id}`)
    console.log(`   Stars: ${meta.stars_total}`)
    console.log(`   语言: ${meta.lang}`)
    console.log(`   话题: ${meta.topics.slice(0, 3).join(', ')}`)
    
    // 测试3: 评分算法
    console.log('\n3️⃣ 测试评分算法...')
    const score = scoreRepo(meta, testRepo.position)
    console.log(`✅ 评分: ${score.score.toFixed(1)}`)
    console.log(`   理由: ${score.reason}`)
    
    // 测试4: 文章生成
    console.log('\n4️⃣ 测试文章生成...')
    const article = await composeArticle({
      id: meta.id,
      stars_total: meta.stars_total,
      topics: meta.topics,
      description: meta.description
    })
    console.log(`✅ 文章生成成功`)
    console.log(`   中文标题: ${article.title_cn}`)
    console.log(`   英文标题: ${article.title_en}`)
    console.log(`   中文摘要: ${article.summary_cn?.slice(0, 100)}...`)
    
    // 测试5: 卡片渲染
    console.log('\n5️⃣ 测试卡片渲染...')
    const svg = await renderCardSVG({
      title: article.title_en || article.title_cn || meta.id,
      repo: meta.id,
      desc: article.summary_en || article.summary_cn,
      stars: meta.stars_total,
      tags: meta.topics.slice(0, 3),
      date: new Date().toISOString().slice(0, 10)
    })
    console.log(`✅ SVG卡片生成成功 (${svg.length} 字符)`)
    
    console.log('\n🎉 所有核心功能测试通过！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  testCore()
}