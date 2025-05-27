import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hhxlbwkhsogifgwlxuru.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeGxid2toc29naWZnd2x4dXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjcwMDEsImV4cCI6MjA2MzkwMzAwMX0.XehmZ9I1UU-nyL73NyfXzbuOA5qc-Je8QGQEUNbDcko';

export const supabase = createClient(supabaseUrl, supabaseKey);
