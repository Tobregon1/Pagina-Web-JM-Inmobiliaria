
// Initialize Supabase Client
// TIENES QUE REEMPLAZAR ESTOS VALORES CON LOS DE TU PROYECTO
const SUPABASE_URL = 'https://ufkgcvkfdjtdxcjdvpza.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVma2djdmtmZGp0ZHhjamR2cHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjM0MTUsImV4cCI6MjA4MzAzOTQxNX0.NZ8MSl7t1Rehnkb8EqBq8HnmfYErGgPwjGwePCeX4WM';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for usage (attaching to window for simple script inclusion)
window.supabaseClient = _supabase;

// Simple connection test
window.testSupabaseConnection = async () => {
    console.log("Testing Supabase connection...");
    try {
        const { data, error } = await _supabase.from('some_table').select('count', { count: 'exact', head: true });
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
