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
    acceptTerms: false,
    companyName: '',
    companySize: '',
    companyDescription: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const roleOptions = [
    { value: 'candidate', label: 'Job Seeker/Candidate' },
    { value: 'recruiter', label: 'Recruiter' },
  ];

  const companySizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '501-1000', label: '501-1000 employees' },
    { value: '1000+', label: '1000+ employees' }
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

    if (formData.role === 'recruiter') {
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
        if (!formData.companySize) newErrors.companySize = 'Company size is required';
        if (!formData.companyDescription) newErrors.companyDescription = 'Company description is required';
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
                // Pass the chosen role and company info in user_metadata
                data: { 
                    user_role: role,
                    company_name: formData.companyName,
                    company_size: formData.companySize,
                    company_description: formData.companyDescription
                } 
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
                roleKey: role,
                companyInfo: role === 'recruiter' ? {
                    name: formData.companyName,
                    size: formData.companySize,
                    description: formData.companyDescription
                } : null
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

        {formData.role === 'recruiter' && (
            <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border animate-in fade-in slide-in-from-top-2">
                <Input
                    label="Company Name"
                    name="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    error={errors.companyName}
                    required
                />
                <Select
                    label="Company Size"
                    options={companySizeOptions}
                    value={formData.companySize}
                    onChange={(val) => setFormData(prev => ({ ...prev, companySize: val }))}
                    placeholder="Select company size"
                    error={errors.companySize}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Description</label>
                    <textarea
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground ${
                            errors.companyDescription ? 'border-error' : 'border-border'
                        }`}
                        placeholder="Tell us about your company..."
                        required
                    />
                    {errors.companyDescription && (
                        <p className="mt-1 text-xs text-error">{errors.companyDescription}</p>
                    )}
                </div>
            </div>
        )}

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