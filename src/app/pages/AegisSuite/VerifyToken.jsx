import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/solid';
import { userService } from 'utils/apiService';

const VerifyToken = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        const response = await userService.verifyRegistrationToken(token);
        console.log('Verification response:', response);

        if (response.status_code === 200 || response.status === 200 || response.success) {
          setVerificationStatus('success');
          setMessage(response.message || 'Verification successful!');
          
          // If there's a redirect URL in the response data field, use it
          if (response.data) {
            console.log('Redirect URL found:', response.data);
            setRedirectUrl(response.data);
            // Redirect immediately
            window.location.href = response.data;
          } else {
            console.log('No redirect URL found, redirecting to login');
            // Default redirect to login page
            setRedirectUrl('/login');
            navigate('/login');
          }
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setVerificationStatus('error');
        
        if (error.response?.status === 404) {
          setMessage('Invalid or expired verification token');
        } else if (error.response?.status === 400) {
          setMessage('Token verification failed. Please try again.');
        } else if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('An error occurred during verification. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleManualRedirect = () => {
    if (redirectUrl) {
      if (redirectUrl.startsWith('http') || redirectUrl.startsWith('https')) {
        window.location.href = redirectUrl;
      } else {
        navigate(redirectUrl);
      }
    } else {
      navigate('/login');
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setVerificationStatus(null);
    setMessage('');
    setRedirectUrl('');
    
    // Retry verification
    const verifyToken = async () => {
      try {
        const response = await userService.verifyRegistrationToken(token);
        if (response.status_code === 200 || response.status === 200 || response.success) {
          setVerificationStatus('success');
          setMessage(response.message || 'Verification successful!');
          if (response.data) {
            console.log('Retry - Redirect URL found:', response.data);
            setRedirectUrl(response.data);
            // Redirect immediately
            window.location.href = response.data;
          } else {
            console.log('Retry - No redirect URL found, redirecting to login');
            setRedirectUrl('/login');
            navigate('/login');
          }
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Verification failed');
        }
      } catch (error) {
        setVerificationStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {loading && (
              <div className="flex flex-col items-center">
                <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Token
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your token...
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="flex flex-col items-center">
                <CheckCircleIcon className="w-12 h-12 text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                {redirectUrl && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Redirecting you now...
                    </p>
                    <button
                      onClick={handleManualRedirect}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Continue Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="flex flex-col items-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;
