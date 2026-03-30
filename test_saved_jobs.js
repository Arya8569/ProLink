const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSavedJobs() {
  try {
    // 1. Get a test user and job
    const { data: user } = await supabase.from('profiles').select('id').limit(1).single();
    const { data: job } = await supabase.from('jobs').select('id').limit(1).single();
    
    if (!user || !job) {
        console.log('Need at least one user and one job in the DB to test.');
        return;
    }

    console.log(`Testing with User: ${user.id}, Job: ${job.id}`);

    // 2. Clear existing (to be clean)
    await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', job.id);

    // 3. Insert
    console.log('Inserting...');
    const { error: insertError } = await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: job.id });
    if (insertError) {
        console.error('Insert Error:', insertError.message);
    } else {
        console.log('Insert Successful.');
    }

    // 4. Select
    console.log('Selecting...');
    const { data: selectData, error: selectError } = await supabase.from('saved_jobs').select('*').eq('user_id', user.id);
    if (selectError) {
        console.error('Select Error:', selectError.message);
    } else {
        console.log('Select Result:', selectData);
    }

  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testSavedJobs();
