import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase configuration missing. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.");
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper function to map Supabase user metadata or form roles 
 * to the simplified application roles used for routing.
 * @param {string} roleKey - The role provided during registration (e.g., 'recruiter', 'candidate').
 * @returns {string} The application role ('jobSeeker', 'recruiter', or 'admin').
 */
export const mapRoleToAppRole = (roleKey) => {
    switch (roleKey) {
        case 'candidate':
            return 'jobSeeker'; 
        case 'recruiter':
        case 'company':
        case 'interviewer':
            // All hiring-side roles map to the recruiter dashboard
            return 'recruiter'; 
        case 'admin':
            return 'admin';
        default:
            return 'jobSeeker';
    }
};

/**
 * Creates a display name based on the email and role for the mock profile data.
 * @param {string} email - User email.
 * @param {string} roleKey - User's detailed role (e.g., 'candidate', 'recruiter').
 * @returns {object} { userName, gender }
 */
export const createMockUserData = (email, roleKey) => {
    const finalAppRole = mapRoleToAppRole(roleKey);
    const nameSuffix = roleKey.charAt(0).toUpperCase() + roleKey.slice(1);
    const namePart = email.split('@')[0];
    
    let userName;
    let gender;
    
    if (finalAppRole === 'recruiter' || finalAppRole === 'admin') {
        userName = namePart === 'admin' || namePart === 'recruiter' ? `Aditi (${nameSuffix})` : `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} (${nameSuffix})`;
        gender = 'women';
    } else if (finalAppRole === 'jobSeeker') {
        userName = namePart === 'candidate' ? `User (${nameSuffix})` : `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} (${nameSuffix})`;
        gender = 'men';
    } else {
        userName = `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} (${nameSuffix})`;
        gender = 'men';
    }
    
    return { userName, gender };
};


/**
 * Fetches the user's profile from the 'profiles' table.
 */
export const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error fetching user profile:', error);
        if (error.code === 'PGRST116') {
            return null; 
        }
        return null;
    }
    return data;
};

/**
 * Creates or updates a profile entry in the 'profiles' table after successful sign-up/in.
 */
export const createOrUpdateProfile = async (user, roleKey) => {
    const finalAppRole = mapRoleToAppRole(roleKey);
    const { userName, gender } = createMockUserData(user.email, roleKey);
    
    const randomSeed = Math.floor(Math.random() * 50) + 1;
    
    // Attempt to insert/update the profile in the public.profiles table
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email: user.email,
            name: userName,
            user_role: roleKey,
            avatar_url: `https://randomuser.me/api/portraits/${gender}/${randomSeed}.jpg`
        }, { onConflict: 'id', ignoreDuplicates: false })
        .select()
        .single();
        
    if (error) {
        console.error('Error creating/updating profile:', error);
        throw error;
    }
    
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: finalAppRole, // Use the mapped application role
        avatar: data.avatar_url
    };
};