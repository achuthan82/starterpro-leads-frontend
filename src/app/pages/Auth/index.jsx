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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting to login...</p>
      </div>
    </div>
  );
}