import { NextRequest, NextResponse } from 'next/server'; import { renderCardSVG } from '@/lib/satori'; import { svgToPng } from '@/lib/png'; import { saveBlob } from '@/lib/blob'
import { publishTelegram } from '@/lib/publishers/telegram'; import { publishDevto } from '@/lib/publishers/devto'; import { publishMedium } from '@/lib/publishers/medium'
export const maxDuration=300; function esc(s?:string){return s?.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')||''}
export async function POST(req:NextRequest){ const a=await req.json(); const svg=await renderCardSVG({title:a.title_en??a.title,repo:a.repo,desc:a.summary,stars:a.stars,date:new Date().toISOString().slice(0,10)})
  const base=`cards/${new Date().toISOString().slice(0,10)}/${a.repo.replace('/','-')}`; const svgUrl=await saveBlob(`${base}.svg`,svg,'image/svg+xml'); const png=await svgToPng(svg); const pngUrl=await saveBlob(`${base}.png`,png,'image/png')
  const dev=await publishDevto({title:a.title_en||a.title,markdown:`![cover](${svgUrl})

${a.body_md||a.summary||''}`}); const med=await publishMedium({title:a.title_en||a.title,html:`<p><img src=\"${svgUrl}\"/></p><p>${esc(a.summary||'')}</p>`}); const tg=await publishTelegram(`<b>${esc(a.title)}</b>
Repo: ${esc(a.repo)}
${esc(a.summary||'')}`,pngUrl)
  return NextResponse.json({ok:true,svgUrl,pngUrl,dev,med,tg}) }