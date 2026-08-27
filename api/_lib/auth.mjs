import { adminClient, json } from "./supabase.mjs";
export async function requireUser(req,res){const m=String(req.headers.authorization||"").match(/^Bearer\s+(.+)$/i);if(!m){json(res,401,{error:"UNAUTHORIZED"});return null}const db=adminClient();const {data,error}=await db.auth.getUser(m[1]);if(error||!data?.user){json(res,401,{error:"UNAUTHORIZED"});return null}return data.user}
