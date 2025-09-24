import { NextResponse } from 'next/server'; import { q } from '@/lib/db'; import { composeArticle } from '@/lib/generate'
export const maxDuration=300

export async function GET(){
  try {
    const rows=await q(`select a.id,a.repo_id,r.stars_total,r.topics,r.readme_excerpt from articles a join repos r on a.repo_id=r.id where a.status='draft' limit 30`)
    let processed = 0, errors = 0
    
    for(const r of rows.rows){
      try {
        const j=await composeArticle({id:r.repo_id,stars_total:r.stars_total||0,topics:r.topics||[],description:r.readme_excerpt||''},process.env.OPENAI_API_KEY)
        await q('update articles set title_cn=$1,title_en=$2,summary_cn=$3,summary_en=$4,body_cn_md=$5,body_en_md=$6,status=$7 where id=$8',[j.title_cn,j.title_en,j.summary_cn,j.summary_en,j.body_md_cn,j.body_md_en,'generated',r.id])
        processed++
      } catch (error) {
        console.error(`Error generating article for ${r.repo_id}:`, error)
        errors++
      }
    }
    
    return NextResponse.json({ok:true,processed,errors})
  } catch (error) {
    console.error('Generate cron failed:', error)
    return NextResponse.json({ok:false, error: String(error)}, {status: 500})
  }
}