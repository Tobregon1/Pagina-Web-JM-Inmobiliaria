
// Initialize Supabase Client
// Credentials provided for client-side access
const SUPABASE_URL = 'https://xtogcevsqgooyuhslpmm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2djZXZzcWdvb3l1aHNscG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjkxMjksImV4cCI6MjA4MDk0NTEyOX0.qXFwVwnz2wo1tCUmJNAmypXEItIF3wA-sB5SLVA2enk';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for usage (attaching to window for simple script inclusion)
window.supabaseClient = _supabase;
