export type RepoMeta={id:string;lang?:string;stars_total:number;topics:string[];description?:string;homepage?:string;license?:string;owner_type?:string}
export async function enrichRepo(full_name:string, token?:string):Promise<RepoMeta>{
  const api=`https://api.github.com/repos/${full_name}`; const headers:Record<string,string>={'user-agent':'vercel-app'}; if(token) headers['authorization']=`Bearer ${token}`
  const res=await fetch(api,{headers}); if(!res.ok) throw new Error('GitHub API failed '+res.status); const j=await res.json() as any
  return { id:full_name, lang:j.language??undefined, stars_total:j.stargazers_count??0, topics:j.topics??[], description:j.description??undefined,
           homepage:j.homepage??undefined, license:j.license?.spdx_id??undefined, owner_type:j.owner?.type??undefined }
}