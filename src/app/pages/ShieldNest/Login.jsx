import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// import ShieldNestLoader from './components/ShieldNestLoader';
import { Spinner } from "components/ui";
import { useAuthContext } from 'app/contexts/auth/context';
import { authService } from 'utils/apiService';
import { getUserRole } from 'configs/auth.config';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthContext();

  // Show token expired error if redirected with error=token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'token') {
      setError('Your token has expired. Please log in again.');
    }
  }, [location.search]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/shieldnest/agent-dashboard');
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error && value) setError('');
  };

  /*const clearAllData = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('agentId');
    localStorage.removeItem('currentUser');
    setError('All authentication data cleared. Please login again.');
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use the real authService to authenticate with ShieldNest API
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('Login API response:', response);

      // Handle different response formats
      const responseData = response.data || response;
      // Check for token in both top level response and data object
      const token = response.auth_token || response.token || response.access_token || response.accessToken ||
                   responseData.token || responseData.access_token || responseData.accessToken || responseData.auth_token;
      const user = responseData.user || responseData;

      console.log('Parsed login data:', { responseData, token, user, fullResponse: response });

      // Check if we have a successful response and a valid token
      if (response && token && (user?.email || responseData?.email)) {
        // Determine user data - could be nested or direct
        const userData = user?.email ? user : (responseData?.email ? responseData : null);
        
        if (userData) {
          // Map role ID to role name
          const roleName = getUserRole(userData);
          
          // Extract agent ID from the response for agent users
          let agentId = null;
          if (roleName === 'agent' && userData.agents && userData.agents.length > 0) {
            agentId = userData.agents[0].id;
            console.log('Agent ID extracted from login response:', agentId);
          }
          
          // Store user information and auth token - only if we have a valid token
          localStorage.setItem('userRole', roleName);
          localStorage.setItem('userEmail', userData.email);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authToken', token);
          
          // Store agent ID if available
          if (agentId) {
            localStorage.setItem('agentId', agentId.toString());
            console.log('Agent ID stored in localStorage:', agentId);
          }
          
          // Store complete user data for reference
          localStorage.setItem('currentUser', JSON.stringify(userData));
          
          // Use the context login method
          await login({
            username: formData.email,
            password: formData.password
          });
          
          // Navigate based on user role
          if (roleName === 'admin') {
            navigate('/shieldnest/admin/users', { replace: true });
          } else {
            navigate('/shieldnest/agent-dashboard', { replace: true });
          }
        } else {
          setError('Login successful but user data not found. Please try again.');
        }
      } else if (!token) {
        setError('Login failed: No authentication token received from server.');
      } else {
        setError(responseData?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Login failed: ${err.message}`);
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    }

    setIsLoading(false);
  };

  /*const fillDemoCredentials = () => {
    setFormData({
      email: 'agent@shieldnest.com',
      password: 'agent123'
    });
    setError('');
  };

  const fillAdminCredentials = () => {
    setFormData({
      email: 'admin@shieldnest.com',
      password: 'admin123'
    });
    setError('');
  };*/

  return (
    <div className="min-h-screen bg-[var(--color-ecru-white)]">
      <div className="flex min-h-full">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-atoll)] via-[var(--color-shadow-green)] to-[var(--color-beryl-green)] relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 text-white z-10">
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <img 
                  src="/shieldnest-icon.png" 
                  alt="ShieldNest" 
                  className="w-16 h-16 mr-4 object-contain"
                />
                <div>
                  <h1 className="text-4xl font-bold">ShieldNest</h1>
                  <p className="text-lg opacity-90">Insurance Lead Management</p>
                </div>
              </div>
              <p className="text-xl text-white/90 mb-6">
                Your trusted partner in insurance lead management
              </p>
              <p className="text-white/80 mb-8">
                Streamline your insurance sales process with powerful lead management tools, 
                real-time analytics, and seamless territory management.
              </p>
            </div>
            
            {/* Features List */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--color-fern)] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Advanced Lead Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--color-fern)] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Territory Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--color-fern)] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[var(--color-fern)] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Lead Marketplace</span>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full"></div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start mb-6 lg:hidden">
                <img 
                  src="/shieldnest-icon.png" 
                  alt="ShieldNest" 
                  className="w-12 h-12 mr-3 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-atoll)]">ShieldNest</h1>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Sign in to your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Access your insurance lead management dashboard
              </p>
            </div>

            {/* API Integration Info */}
            {/* <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-green-600 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-800">API Connected</h4>
                  <p className="mt-1 text-sm text-green-700">
                    This login now connects directly to the ShieldNest API. Use your registered credentials to access the system.
                  </p>
                  <div className="mt-2 text-xs text-green-600 space-y-1">
                    <div><strong>Agent:</strong> agent@shieldnest.com / agent123</div>
                    <div><strong>Admin:</strong> admin@shieldnest.com / admin123</div>
                  </div>
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={fillDemoCredentials}
                      className="text-xs text-green-800 hover:text-green-900 underline"
                    >
                      Fill Agent
                    </button>
                    <button
                      onClick={fillAdminCredentials}
                      className="text-xs text-green-800 hover:text-green-900 underline"
                    >
                      Fill Admin
                    </button>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={clearAllData}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Clear cached data
                    </button>
                  </div>
                </div> 
              </div>
            </div> */}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)] pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-atoll)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-atoll)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner color="info" className="size-4 border" />
                      <span className="ml-3">Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/AegisSuite/forgot-password"
                  className="text-sm text-[var(--color-atoll)] hover:text-opacity-80 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 ShieldNest. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 