import { NextResponse } from 'next/server'; import { q } from '@/lib/db'; import { fetchTrending } from '@/lib/trending'; import { enrichRepo } from '@/lib/github'; import { scoreRepo } from '@/lib/score'
export const maxDuration=300

async function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)) }

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      const delay = baseDelay * Math.pow(2, i)
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, error)
      await sleep(delay)
    }
  }
  throw new Error('Max retries exceeded')
}

export async function GET(){
  try {
    const langs=['all','typescript','python','rust','go']; const token=process.env.GITHUB_TOKEN
    let totalProcessed = 0, totalErrors = 0
    
    for(const lang of langs){
      console.log(`Processing language: ${lang}`)
      try {
        const items = await retryWithBackoff(() => fetchTrending(lang,'daily'))
        let pos=0
        
        for(const it of items){ 
          pos++; 
          try {
            const meta = await retryWithBackoff(() => enrichRepo(it.full_name,token))
            await q('insert into repos(id,lang,stars_total,topics,readme_excerpt,homepage,license,owner_type) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict (id) do update set lang=excluded.lang, stars_total=excluded.stars_total, topics=excluded.topics, homepage=excluded.homepage, license=excluded.license, owner_type=excluded.owner_type',[meta.id,meta.lang,meta.stars_total,JSON.stringify(meta.topics),null,meta.homepage,meta.license,meta.owner_type])
            const s=scoreRepo(meta as any,pos); const today=new Date().toISOString().slice(0,10)
            await q('insert into picks(id,repo_id,score,reason,date) values ($1,$2,$3,$4,$5) on conflict (id) do nothing',[meta.id+'@'+today,meta.id,s.score,s.reason,today])
            const aid=meta.id.replace('/','-')+'-'+today; await q('insert into articles(id,repo_id,status) values ($1,$2,$3) on conflict (id) do nothing',[aid,meta.id,'draft'])
            totalProcessed++
            // Rate limiting: wait between GitHub API calls
            await sleep(300)
          } catch (error) {
            console.error(`Error processing ${it.full_name}:`, error)
            totalErrors++
          }
        }
      } catch (error) {
        console.error(`Error fetching trending for ${lang}:`, error)
        totalErrors++
      }
    }
    
    return NextResponse.json({ok:true, processed: totalProcessed, errors: totalErrors})
  } catch (error) {
    console.error('Fetch cron failed:', error)
    return NextResponse.json({ok:false, error: String(error)}, {status: 500})
  }
}