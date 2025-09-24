export type TrendingItem={full_name:string;lang?:string;position:number}
export async function fetchTrending(lang='all',period:'daily'|'weekly'|'monthly'='daily'):Promise<TrendingItem[]>{
  const url=`https://github.com/trending${lang!=='all'?'/'+encodeURIComponent(lang):''}?since=${period}`
  const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}}); if(!res.ok) throw new Error('Trending fetch failed '+res.status)
  const html=await res.text(); const items:TrendingItem[]=[]; const re=/href="\/([^\/]+)\/([^\/"]+)"\s+data-view-component="true"\s+class="\s*Link\s*"/g
  const seen=new Set<string>(); let m:RegExpExecArray|null; let pos=0
  while((m=re.exec(html)) && pos<50){ const full=`${m[1]}/${m[2]}`; if(seen.has(full)) continue; seen.add(full); items.push({full_name:full,lang:lang==='all'?undefined:lang,position:++pos}) }
  return items
}