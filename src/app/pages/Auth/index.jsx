// Import Dependencies
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

export default function SignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to AegisSuite login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
        <p className="text-gray-900 dark:text-gray-100">Redirecting to login...</p>
      </div>
    </div>
  );
}