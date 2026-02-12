import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { supabase } from '../../../supabaseClient'; // Import Supabase Client

const LoginForm = ({ onLogin, isLoading, onToggleMode }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Built-in fixed mock credentials to check for INITIAL DATA SEEDING purposes.
  // These emails/passwords must be manually added to your Supabase Auth user list.
  const fixedCredentials = {
    candidate: { email: 'candidate@prolink.com', password: 'candidate123', roleKey: 'candidate' },
    recruiter: { email: 'recruiter@prolink.com', password: 'recruiter123', roleKey: 'recruiter' },
    company: { email: 'company@prolink.com', password: 'company123', roleKey: 'company' },
    interviewer: { email: 'interviewer@prolink.com', password: 'interviewer123', roleKey: 'interviewer' },
    admin: { email: 'admin@prolink.com', password: 'admin123', roleKey: 'admin' }
  };

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const { email, password } = formData;
    setGeneralError('');

    try {
        // 1. Call Supabase sign in
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            setGeneralError(error.message); 
            return;
        }

        // 2. Authentication successful, determine the role
        // The role should be stored in user_metadata during registration.
        let userRoleKey = user?.user_metadata?.user_role;
        
        // Fallback for fixed mock accounts (needed if metadata wasn't set manually in Supabase)
        if (!userRoleKey) {
            const fixedMatch = Object.values(fixedCredentials).find(cred => cred.email === email);
            userRoleKey = fixedMatch ? fixedMatch.roleKey : 'candidate'; 
        }

        // 3. Pass user data to onLogin handler
        await onLogin({
            user,
            roleKey: userRoleKey
        });

    } catch (err) {
        console.error('Login failed:', err);
        setGeneralError('An unexpected error occurred during login.');
    }
  };

  const handleSocialLogin = async (provider) => {
    setGeneralError('');
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            setGeneralError(error.message);
        }
    } catch (err) {
        console.error('Social login failed:', err);
        setGeneralError('An unexpected error occurred during social login.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
          <Icon name="Zap" size={32} color="white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your ProLink account</p>
      </div>
      {(generalError || errors.general) && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-error mb-1">Authentication Failed</p>
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
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
          />
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 transition-smooth"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="h-12"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card/90 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="h-12"
          >
            <Icon name="Chrome" size={20} className="mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('linkedin')}
            disabled={isLoading}
            className="h-12"
          >
            <Icon name="Linkedin" size={20} className="mr-2" />
            LinkedIn
          </Button>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-primary hover:text-primary/80 font-medium transition-smooth"
            onClick={onToggleMode}
          >
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
