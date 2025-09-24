export async function publishTelegram(text:string,imageUrl?:string){
  const token=process.env.TELEGRAM_BOT_TOKEN!, chatId=process.env.TELEGRAM_CHAT_ID!
  if(!token||!chatId) throw new Error('missing telegram env')
  if(imageUrl){ const form=new FormData(); form.append('chat_id',chatId); form.append('photo',imageUrl); form.append('caption',text); form.append('parse_mode','HTML')
    const r=await fetch(`https://api.telegram.org/bot${token}/sendPhoto`,{method:'POST',body:form}); const j=await r.json(); if(!j.ok) throw new Error('telegram '+JSON.stringify(j))
    const url=`https://t.me/c/${String(j.result?.chat?.id||'').replace('-100','')}/${j.result?.message_id}`; return {url,id:String(j.result?.message_id)} }
  const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text,parse_mode:'HTML'})})
  const j=await r.json(); if(!j.ok) throw new Error('telegram '+JSON.stringify(j)); const url=`https://t.me/c/${String(j.result?.chat?.id||'').replace('-100','')}/${j.result?.message_id}`; return {url,id:String(j.result?.message_id)} }
