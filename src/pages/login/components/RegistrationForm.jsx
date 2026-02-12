import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../supabaseClient'; // Import Supabase Client

const RegistrationForm = ({ onRegister, isLoading, onToggleMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'candidate', // Default role
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const roleOptions = [
    { value: 'candidate', label: 'Job Seeker/Candidate' },
    { value: 'recruiter', label: 'Recruiter' },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters long`;
    }
    if (!hasUppercase) {
        return 'Password must include at least one uppercase letter';
    }
    if (!hasLowercase) {
        return 'Password must include at least one lowercase letter';
    }
    if (!hasNumber) {
        return 'Password must include at least one number';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    if (!formData.role) {
        newErrors.role = 'Role is required';
    }

    if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setGeneralError('');

    try {
        const { email, password, role } = formData;
        
        // 1. Call Supabase sign up
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // Pass the chosen role in user_metadata
                data: { user_role: role } 
            }
        });

        if (error) {
            setGeneralError(error.message);
            return;
        }
        
        if (!data.user) {
            // This handles scenario where an email is sent but user isn't immediately logged in (email confirmation needed)
            setGeneralError("Registration successful! Please check your email to confirm your account before logging in.");
            return;
        }

        // 2. Registration successful & user logged in: proceed to create/update profile
        try {
            await onRegister({ 
                user: data.user,
                roleKey: role
            });
        } catch (profileError) {
            // CRITICAL: Handle profile creation failure and provide better feedback
            console.error('Profile creation failed after sign up:', profileError);
            setGeneralError(`Registration failed to finalize your profile. Reason: ${profileError.message}. Please verify the INSERT RLS policy on the 'profiles' table.`);
            // Sign out the user created in Auth to prevent half-registered state
            await supabase.auth.signOut();
        }
        
    } catch (err) {
        console.error('Registration failed:', err);
        setGeneralError('An unexpected error occurred during registration.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
          <Icon name="UserPlus" size={32} color="white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">Sign up to get started with ProLink</p>
      </div>
      {(generalError || errors.general) && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error mb-1">Registration Failed</p>
              <p className="text-xs text-error/80">{generalError || errors.general}</p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />
        
        <div className="text-xs text-muted-foreground -mt-4 mb-2 p-1">
            Min 8 chars, 1 uppercase, 1 lowercase, 1 number.
        </div>

        <Select
            label="Your Role"
            options={roleOptions}
            value={formData.role}
            onChange={handleRoleChange}
            placeholder="Select your role"
            error={errors.role}
            required
        />

        <Checkbox
            label="I accept the Terms of Service and Privacy Policy"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            error={errors.acceptTerms}
            required
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="h-12"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            className="text-primary hover:text-primary/80 font-medium transition-smooth"
            onClick={onToggleMode}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;