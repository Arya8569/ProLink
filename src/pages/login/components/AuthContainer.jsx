import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import { supabase, mapRoleToAppRole, createOrUpdateProfile, fetchUserProfile } from '../../../supabaseClient';

const AuthContainer = ({ onLogin, isLoading }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Check Supabase session on initial load
  useEffect(() => {
    const checkSession = async () => {
      // Get the currently logged-in Supabase user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the profile created during registration/login
        const profile = await fetchUserProfile(user.id);
        
        if (profile) {
            const userData = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: mapRoleToAppRole(profile.user_role), // Use role from DB
                avatar: profile.avatar_url // Use avatar from DB
            };
            // This triggers the local user state update and redirect in LoginPage.jsx
            onLogin(userData); 
        } else {
            // Handle case where auth user exists but profile table entry is missing/deleted.
            // This can happen on fresh signup before metadata is set, but should be handled by handleSupabaseAuthCallback.
            // For a robust app, we might force a profile creation/update here.
            // For now, assume handleSupabaseAuthCallback is the primary path after form submission/social login.
            console.warn('Auth user found, but profile entry missing or not yet created. Relying on next step.');
        }
      }
    };
    checkSession();
  }, []);

  const handleSupabaseAuthCallback = async ({ user, roleKey }) => {
    if (!user) return; 

    // Create or update the profile entry in the 'profiles' table
    try {
        const userData = await createOrUpdateProfile(user, roleKey);
        
        // Proceed to login flow handler in LoginPage.jsx
        await onLogin(userData);
    } catch (error) {
        console.error("Failed to process user profile after auth:", error);
        // Fallback: Sign out to prevent user access without a profile
        await supabase.auth.signOut();
    }
  };

  return (
    <div className="w-full max-w-md">
        {isLoginMode ? (
            <LoginForm 
                onLogin={handleSupabaseAuthCallback} 
                isLoading={isLoading} 
                onToggleMode={() => setIsLoginMode(false)}
            />
        ) : (
            <RegistrationForm 
                onRegister={handleSupabaseAuthCallback} 
                isLoading={isLoading} 
                onToggleMode={() => setIsLoginMode(true)}
            />
        )}
    </div>
  );
};

export default AuthContainer;