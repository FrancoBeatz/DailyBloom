import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ysnwuehcbvnevuuqcyyx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzbnd1ZWhjYnZuZXZ1dXFjeXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTk2OTUsImV4cCI6MjA4OTIzNTY5NX0.Efi5SB_9NkqbiPK_k0gFB5SB3pze0uMv77UXPjZK4O4';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
