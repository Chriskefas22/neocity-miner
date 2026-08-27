import { createClient } from "@supabase/supabase-js";
export function adminClient(){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("SUPABASE_SERVER_NOT_CONFIGURED");return createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})}
export function json(res,status,body){res.status(status);res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body))}
export async function readBody(req){if(req.body&&typeof req.body==="object")return req.body;return await new Promise(resolve=>{let s="";req.on("data",c=>s+=c);req.on("end",()=>{try{resolve(JSON.parse(s||"{}"))}catch{resolve({})}})})}
