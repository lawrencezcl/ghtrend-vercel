import satori from 'satori'; import React,{JSX} from 'react'
export type CardProps={title:string;repo:string;desc?:string;stars:number;weeklyDelta?:number;tags?:string[];date?:string}
function Card({title,repo,desc,stars,weeklyDelta,tags=[],date}:CardProps){
  return (<div style={{width:1200,height:630,display:'flex',flexDirection:'column',background:'#0B1220',color:'#E6EDF3',padding:48,fontFamily:'Inter'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:32,opacity:.8}}>GitHub Trending • {date??''}</div><div style={{fontSize:28,opacity:.7}}>github.com/{repo}</div></div>
    <div style={{marginTop:28,fontSize:56,fontWeight:700,lineHeight:1.2}}>{title}</div>
    {desc && <div style={{marginTop:18,fontSize:30,lineHeight:1.4,color:'#B6C2CF'}}>{desc}</div>}
    <div style={{display:'flex',gap:18,marginTop:28}}>
      <div style={pill()}>⭐ Stars:<b style={{marginLeft:8}}>{stars.toLocaleString()}</b></div>
      {typeof weeklyDelta==='number' && (<div style={pill(weeklyDelta>=0?'#143D2E':'#4A1D1A',weeklyDelta>=0?'#39D353':'#FF7B72')}>7d Δ:<b style={{marginLeft:8}}>{weeklyDelta>=0?'+':''}{weeklyDelta}</b></div>)}
    </div>
    {tags.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:22}}>{tags.map((t,i)=><div key={i} style={tag()}>{t}</div>)}</div>}
    <div style={{marginTop:'auto',fontSize:22,opacity:.7}}>Source: GitHub • Attribution to repo authors</div>
  </div>)}
function pill(bg='#10243E',color='#E6EDF3'){return {background:bg,color,padding:'10px 16px',borderRadius:14,fontSize:26,display:'inline-flex',alignItems:'center'} as React.CSSProperties}
function tag(){return {background:'#0E1626',padding:'8px 14px',borderRadius:12,fontSize:22,color:'#9DB1C9',border:'1px solid #1B2A44'} as React.CSSProperties}
let fontBuf:ArrayBuffer|null=null; async function loadFont(){ if(fontBuf) return fontBuf; const res=await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7GQ.woff2'); fontBuf=await res.arrayBuffer(); return fontBuf!}
export async function renderCardSVG(props:CardProps){ const font=await loadFont(); const svg=await satori(React.createElement(Card,props) as unknown as JSX.Element,{width:1200,height:630,fonts:[{name:'Inter',data:font,weight:400,style:'normal'}]}); return svg as unknown as string }
