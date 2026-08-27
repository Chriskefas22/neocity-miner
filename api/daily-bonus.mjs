import { json } from "./_lib/supabase.mjs";
import { requireUser } from "./_lib/auth.mjs";
export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{error:"METHOD_NOT_ALLOWED"});
  const user=await requireUser(req,res); if(!user)return;
  return json(res,409,{error:"RULE_NOT_CONFIGURED",message:"Daily Bonus requires a configured reward rule and claim ledger before production credit can be enabled."});
}
