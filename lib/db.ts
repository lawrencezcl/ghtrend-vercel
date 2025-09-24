import { Pool } from 'pg'
let pool: Pool | null = null
export function db(){ if(!pool){ pool=new Pool({ connectionString: process.env.DATABASE_URL }) } return pool }
export async function q(text: string, params: any[] = []){ const c=await db().connect(); try{ return await c.query(text, params) } finally{ c.release() } }
