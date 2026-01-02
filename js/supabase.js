
// Initialize Supabase Client
// Credentials provided for client-side access
const SUPABASE_URL = 'https://xtogcevsqgooyuhslpmm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0b2djZXZzcWdvb3l1aHNscG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNjkxMjksImV4cCI6MjA4MDk0NTEyOX0.qXFwVwnz2wo1tCUmJNAmypXEItIF3wA-sB5SLVA2enk';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for usage (attaching to window for simple script inclusion)
window.supabaseClient = _supabase;

// Simple connection test
window.testSupabaseConnection = async () => {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await _supabase.from('some_table').select('count', { count: 'exact', head: true });
        // unauthenticated users might not have access to random tables, but 'auth' check is better
        const { data: authData, error: authError } = await _supabase.auth.getSession();

        if (authError) {
            console.error("Supabase Auth Error:", authError);
            return false;
        }
        console.log("Supabase Connection Successful! Session:", authData);
        return true;
    } catch (err) {
        console.error("Supabase Connection Failed:", err);
        return false;
    }
};

// Auto-run test on load (optional, can be removed later)
// window.testSupabaseConnection();
