const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    const { data, error } = await supabase
      .from('profiles') // Use a table we know exists
      .select('count', { count: 'exact', head: true });
    
    console.log('Successfully connected to Supabase.');
    
    // Attempting to use rpc if available, or just check multiple likely tables
    const tablesToCheck = ['profiles', 'jobs', 'applications', 'saved_jobs'];
    for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.log(`Table '${table}': Error - ${error.message}`);
        } else {
            console.log(`Table '${table}': Exists`);
        }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

listTables();
