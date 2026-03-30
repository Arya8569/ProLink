const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
  try {
    const { data: profiles } = await supabase.from('profiles').select('id, email').limit(5);
    console.log('Sample profiles:', profiles);

    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching saved_jobs:', error.message);
    } else {
      console.log('Saved jobs count:', data.length);
      console.log('Saved jobs entries:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

inspectTable();
