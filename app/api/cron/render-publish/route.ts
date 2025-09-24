import { NextResponse } from 'next/server'
import { q } from '@/lib/db'
import { renderCardSVG } from '@/lib/satori'
import { svgToPng } from '@/lib/png'
import { saveBlob } from '@/lib/blob'
import { publishTelegram } from '@/lib/publishers/telegram'
import { publishDevto } from '@/lib/publishers/devto'
import { publishMedium } from '@/lib/publishers/medium'
import crypto from 'node:crypto'

export const maxDuration = 300

function esc(s?: string) {
  return s?.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''
}

export async function GET() {
  try {
    const { rows } = await q(`
      SELECT a.*, r.stars_total 
      FROM articles a 
      JOIN repos r ON a.repo_id = r.id 
      WHERE a.status IN ('draft', 'generated') 
      LIMIT 20
    `)
    
    for (const a of rows) {
      const svg = await renderCardSVG({
        title: a.title_en || a.title_cn || a.repo_id,
        repo: a.repo_id,
        desc: a.summary_en || a.summary_cn,
        stars: a.stars_total || 0,
        date: new Date().toISOString().slice(0, 10)
      })
      
      const base = `cards/${new Date().toISOString().slice(0, 10)}/${a.repo_id.replace('/', '-')}`
      const svgUrl = await saveBlob(`${base}.svg`, svg, 'image/svg+xml')
      const png = await svgToPng(svg)
      const pngUrl = await saveBlob(`${base}.png`, png, 'image/png')
      
      await q(
        'UPDATE articles SET assets = $1, status = $2 WHERE id = $3',
        [JSON.stringify([svgUrl, pngUrl]), 'ready', a.id]
      )
      
      const md = `![cover](${svgUrl})\n\n${a.body_en_md || a.body_cn_md || ''}`
      
      try {
        const dev = await publishDevto({
          title: a.title_en || a.title_cn,
          markdown: md,
          tags: ['github', 'trending'],
          description: (a.summary_en || a.summary_cn || '').slice(0, 160),
          cover: svgUrl
        })
        await q(
          'INSERT INTO publishes(id, article_id, platform, post_url, post_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [crypto.randomUUID(), a.id, 'devto', dev.url, dev.id, 'sent']
        )
      } catch (e) {
        console.error('DevTo publish failed:', e)
      }
      
      try {
        const med = await publishMedium({
          title: a.title_en || a.title_cn,
          html: `<p><img src="${svgUrl}"/></p><p>${esc(a.summary_en || a.summary_cn || '')}</p>`
        })
        await q(
          'INSERT INTO publishes(id, article_id, platform, post_url, post_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [crypto.randomUUID(), a.id, 'medium', med.url, med.id, 'sent']
        )
      } catch (e) {
        console.error('Medium publish failed:', e)
      }
      
      try {
        const tg = await publishTelegram(
          `<b>${esc(a.title_en || a.title_cn)}</b>\nRepo: ${esc(a.repo_id)}\n${esc(a.summary_en || a.summary_cn || '')}`,
          pngUrl
        )
        await q(
          'INSERT INTO publishes(id, article_id, platform, post_url, post_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
          [crypto.randomUUID(), a.id, 'telegram', tg.url || '', tg.id || '', 'sent']
        )
      } catch (e) {
        console.error('Telegram publish failed:', e)
      }
      
      await q('UPDATE articles SET status = $1 WHERE id = $2', ['published', a.id])
    }
    
    return NextResponse.json({ ok: true, processed: rows.length })
  } catch (error) {
    console.error('Render-publish cron failed:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}