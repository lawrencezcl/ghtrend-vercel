import OpenAI from 'openai'
export async function composeArticle(input:{id:string,stars_total:number,topics:string[],description?:string}, apiKey?:string){
  const tags=(input.topics?.slice(0,6)??[]).map(t=>t.toLowerCase())
  if(!apiKey){ const base=input.id.split('/')[1]?.replace(/[-_]/g,' ').replace(/\b\w/g,m=>m.toUpperCase())||input.id
    const title_en=`${base}: ${input.description||'Trending on GitHub'}`.slice(0,90)
    const title_cn=`${base}：${input.description||'GitHub 热门'}`.slice(0,30)
    const summary_en=`Why it matters: ${input.description||'A notable trending repository'}\nHighlights: stars ${input.stars_total}, topics ${tags.join(', ')||'n/a'}`
    const summary_cn=`为什么值得关注：${input.description||'一个值得关注的热门仓库'}\n亮点：Stars ${input.stars_total}，话题 ${tags.join('、')||'无'}`
    return { title_en, title_cn, summary_en, summary_cn, body_md_en:`# ${base}\n\n${summary_en}\n\n- Repo: https://github.com/${input.id}`, body_md_cn:`# ${base}\n\n${summary_cn}\n\n- 仓库： https://github.com/${input.id}`, tags } }
  const client=new OpenAI({ apiKey }); const rsp=await client.chat.completions.create({ model:'gpt-4o-mini',
    messages:[{role:'system',content:'You are a bilingual technical writer.'},{role:'user',content:`Repository: ${input.id}\nStars: ${input.stars_total}\nTopics: ${input.topics.join(', ')}\nDesc: ${input.description}\nReturn JSON with: title_en,title_cn,summary_en,summary_cn,body_md_en,body_md_cn,tags[]`}],
    response_format:{type:'json_object'} }); return JSON.parse(rsp.choices[0].message.content||'{}')
}
