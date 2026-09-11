// Barrel volontairement limité aux utilitaires partagés.
// Les composants clients importent `@/lib/supabase/client` ; les Server
// Components importent `@/lib/supabase/server`, pour éviter de tirer
// `next/headers` dans un bundle navigateur.
export type { Database } from "./types";