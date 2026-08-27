(() => {
  "use strict";
  const C = window.NEOCITY_CONFIG;
  if (!window.supabase || !C?.supabase?.url || !C?.supabase?.publishableKey) return;

  window.NeoSupabase = window.supabase.createClient(
    C.supabase.url,
    C.supabase.publishableKey,
    { auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }
  );

  window.NeoAuth = {
    async getSession() {
      const {data} = await window.NeoSupabase.auth.getSession();
      return data?.session || null;
    },
    async signInWithOAuth(provider) {
      return window.NeoSupabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: location.origin + (C.auth?.callbackPath || "/") }
      });
    },
    async signUp(email,password,metadata,captchaToken) {
      return window.NeoSupabase.auth.signUp({
        email,password,
        options: { data:metadata||{}, captchaToken:captchaToken||undefined, emailRedirectTo:location.origin + (C.auth?.callbackPath || "/") }
      });
    },
    async signInPassword(email,password) {
      return window.NeoSupabase.auth.signInWithPassword({email,password});
    },
    async signOut() {
      return window.NeoSupabase.auth.signOut();
    }
  };
})();
