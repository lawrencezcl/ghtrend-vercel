export async function publishMedium(p:{title:string,html:string,tags?:string[]}){
  const token=process.env.MEDIUM_TOKEN!; const me=await fetch('https://api.medium.com/v1/me',{headers:{Authorization:`Bearer ${token}`}}); const mj=await me.json(); if(!me.ok) throw new Error('medium /me '+JSON.stringify(mj))
  const uid=mj.data.id; const r=await fetch(`https://api.medium.com/v1/users/${uid}/posts`,{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({title:p.title,contentFormat:'html',content:p.html,tags:p.tags??['github','trending'],publishStatus:'public',notifyFollowers:false})})
  const j=await r.json(); if(!r.ok) throw new Error('medium '+JSON.stringify(j)); return {url:j.data.url,id:j.data.id}
}