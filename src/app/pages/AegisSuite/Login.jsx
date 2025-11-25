import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
// import ShieldNestLoader from './components/ShieldNestLoader';
import { Spinner } from "components/ui";
import { useAuthContext } from 'app/contexts/auth/context';
import { authService } from 'utils/apiService';

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
      navigate('/agent-dashboard');
    }
  }, [navigate])

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

      console.log('Login API response:', response.data);

      // Handle the response structure from your API
      const responseData = response;
      // Extract token from the correct location
      const token = responseData.auth_token;
      const userData = responseData.data;

      console.log('Parsed login data:', { responseData, token, userData, fullResponse: response });
      console.log('res', responseData)
      // Check if we have a successful response and a valid token
      if (response && token && userData?.email) {
        // Map role ID to role name (1 = admin, 2 = agent)
        const roleName = userData.role_id === 1 ? 'admin' : 'agent';
        
        // Extract agent ID from the response for agent users
        let agentId = null;
        if (roleName === 'agent' && userData.agents && userData.agents.length > 0) {
          agentId = userData.agents[0].id;
          console.log('Agent ID extracted from login response:', agentId);
        }
        
        console.log('Login - User role mapping:', { 
          originalRoleId: userData.role_id, 
          mappedRole: roleName,
          agentId: agentId,
          userData,
          token: token
        });
        
        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', roleName);
        localStorage.setItem('userEmail', userData.email);
        
        console.log('Login - Data stored in localStorage:', {
          authToken: token,
          isAuthenticated: 'true',
          userRole: roleName,
          userEmail: userData.email
        });
        
        // Store agent ID if available
        if (agentId) {
          localStorage.setItem('agentId', agentId.toString());
          console.log('Agent ID stored in localStorage:', agentId);
        }
        
        // Store complete user data for reference
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Use the context login method
        await login({
          username: formData.email
        });
        
        // Navigate based on user role
        if (roleName === 'admin') {
          navigate('/admin/users', { replace: true });
        } else {
          navigate('/agent-dashboard', { replace: true });
        }
      } else if (response?.data?.temp_membership_token){
         navigate(`subscription/${response?.data?.temp_membership_token}`)   
      } else if (!token) {
        console.log('res-else', fullResponse)
        setError('Login failed: No authentication token received from server.');
      } else {
        setError('Login successful but user data not found. Please try again.');
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
  } finally {
    setIsLoading(false);
  }
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
    <div className="min-h-screen bg-[#0a2463] dark:bg-gray-900">
      <div className="flex min-h-full">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0a2463] dark:bg-gray-900 relative overflow-hidden">
          <div className="flex flex-col justify-center px-12 text-white z-10">
            {/* Logo and Brand */}
            <div className="mb-8">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-yellow-200/50 bg-gradient-to-br from-white to-yellow-50 shadow-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-aegis-navy h-12 w-12"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <div className="">
                <h1 className="font-montserrat mb-2 text-4xl font-black text-white">
                  <span className="text-white">Aegis</span>
                  <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
                    Suite
                  </span>
                </h1>
                <p className="text-lg text-white/90">Mortgage Protection Lead Management System</p>
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
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Advanced Lead Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Territory Management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
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
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <div className="flex items-center justify-center lg:justify-start mb-6 lg:hidden">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-yellow-50 dark:from-gray-700 dark:to-yellow-500/20 border-2 border-yellow-200/50 dark:border-yellow-400/50 rounded-2xl flex items-center justify-center mr-3 shadow-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#0a2463] dark:text-blue-400 h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400">
                    <span className="text-[#0a2463] dark:text-blue-400">Aegis</span>
                    <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 bg-clip-text text-transparent">Suite</span>
                  </h1>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400 lg:text-3xl">Sign in to your account</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
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
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#0a2463] dark:text-blue-400 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 focus:border-[#0a2463] dark:focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#0a2463] dark:text-blue-400 mb-2">
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
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0a2463] dark:focus:ring-blue-500 focus:border-[#0a2463] dark:focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-b from-[#f4d03f] to-[#e6c23a] dark:from-blue-600 dark:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-[#e6c23a] hover:to-[#d4b82a] dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  to="/forgot-password"
                  className="text-sm text-[#0a2463] dark:text-blue-400 hover:text-[#0a1a4a] dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                © 2025 AegisSuite. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 