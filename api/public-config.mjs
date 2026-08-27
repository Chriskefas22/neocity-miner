import {json} from "./_lib/supabase.mjs";
export default async function handler(req,res){return json(res,200,{turnstileSiteKey:process.env.TURNSTILE_SITE_KEY||"",auth:{google:true,x:true,telegram:true}})}
