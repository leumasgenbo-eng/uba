import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, use environment variables (process.env.VITE_SUPABASE_URL, etc.)
// For this demo, replace these placeholders with your actual Supabase Project details.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
