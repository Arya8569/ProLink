const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        console.log('saved_jobs table does not exist.');
      } else {
        console.error('Error checking saved_jobs table:', error.message);
      }
    } else {
      console.log('saved_jobs table exists.');
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

checkTable();
