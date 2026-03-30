const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error checking schema:', error.message);
  } else {
    console.log('Schema for saved_jobs:', data.length > 0 ? Object.keys(data[0]) : 'No data, columns unknown.');
    if (data.length === 0) {
        // Try to insert a mock record to see columns or just list columns via rpc if possible, 
        // but let's try a different query
        const { data: colData, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'saved_jobs' });
        if (colError) {
            console.log('RPC failed, trying fallback.');
        } else {
            console.log('Columns:', colData);
        }
    }
  }
}

checkSchema();
