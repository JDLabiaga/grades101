import { createClient } from '@supabase/supabase-js';

// Your unique Supabase connection details
const supabaseUrl = 'https://artekrtbnbuuuhdiuafc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydGVrcnRibmJ1dXVoZGl1YWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNzU5ODUsImV4cCI6MjA5MDg1MTk4NX0.YcacLHYQVJfirH-fwr2DnKhfQhT9aYZKahdSbRZtD48';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);