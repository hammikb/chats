import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://kadthcrteezwmbdywsbi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZHRoY3J0ZWV6d21iZHl3c2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMTQ3MzgsImV4cCI6MjA1MTg5MDczOH0.li3fkI2pajmtWb1gHycF242eGk58OZkBmvZlpj3h3Ek';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
