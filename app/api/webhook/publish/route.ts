import { NextRequest, NextResponse } from 'next/server'; import { q } from '@/lib/db'; import crypto from 'node:crypto'
export const maxDuration=300
function eq(a:string,b:string){ const A=Buffer.from(a,'hex'),B=Buffer.from(b,'hex'); if(A.length!==B.length) return false; return crypto.timingSafeEqual(A,B) }
export async function POST(req:NextRequest){ 
  try {
    const ts=Number(req.headers.get('x-timestamp')||0); const sig=(req.headers.get('x-signature')||'').toLowerCase(); const secret=process.env.WEBHOOK_SECRET||''
    if(!secret) return NextResponse.json({error:'webhook secret not configured'},{status:500})
    if(Math.abs(Date.now()/1000 - ts)>300) return NextResponse.json({error:'timestamp skew'},{status:401})
    
    const raw=await req.text()
    if(!raw) return NextResponse.json({error:'empty request body'},{status:400})
    
    const expect=crypto.createHmac('sha256',secret).update(`${ts}.${raw}`).digest('hex')
    if(!eq(expect,sig)) return NextResponse.json({error:'bad signature'},{status:401})
    
    let payload
    try {
      payload = JSON.parse(raw)
    } catch (error) {
      return NextResponse.json({error:'invalid JSON'},{status:400})
    }
    
    if(!payload.article?.id) return NextResponse.json({error:'missing article.id'},{status:400})
    if(!payload.platform) return NextResponse.json({error:'missing platform'},{status:400})
    
    await q('insert into publishes(id, article_id, platform, status) values ($1,$2,$3,$4)',[crypto.randomUUID(), payload.article.id, payload.platform, 'queued'])
    return NextResponse.json({ok:true})
  } catch (error) {
    console.error('Webhook publish failed:', error)
    return NextResponse.json({ok:false, error: String(error)}, {status: 500})
  }
}