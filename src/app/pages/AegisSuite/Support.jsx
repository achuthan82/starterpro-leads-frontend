import { useEffect } from 'react';
import { Card, Spinner } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const Support = () => {

  const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || 'http://support-ticket-shieldnest-staging.s3-website-us-east-1.amazonaws.com';

  useEffect(() => {
    // Get the access token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      // Construct the support URL with the token
      const supportUrl = `${SUPPORT_URL}/login/${authToken}`;
      
      // Open the support URL in a new tab
      window.location.href = supportUrl;
    } else {
      console.error('No access token found. Please log in again.');
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SharedSidebar currentPath="/support" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Support</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Redirecting you to our support portal...
              </p>
            </div>

            <Card className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <QuestionMarkCircleIcon className="h-16 w-16 text-blue-500" />
                
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Opening Support Portal
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    You are being redirected to our support portal where you can:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 w-full max-w-2xl">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Get Help</h3>
                    <p className="text-sm text-blue-700">
                      Find answers to common questions and troubleshooting guides
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Submit Tickets</h3>
                    <p className="text-sm text-green-700">
                      Create support tickets for technical issues or feature requests
                    </p>
                  </div>
                  
                  {/* <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">Live Chat</h3>
                    <p className="text-sm text-purple-700">
                      Chat with our support team in real-time for immediate assistance
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-medium text-orange-900 mb-2">Knowledge Base</h3>
                    <p className="text-sm text-orange-700">
                      Browse our comprehensive documentation and tutorials
                    </p>
                  </div> */}
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Spinner size="sm" />
                  <span className="text-sm text-gray-500">
                    If the support portal doesn&apos;t open automatically, 
                    <a 
                      href={`${SUPPORT_URL}/login/${localStorage.getItem('authToken') || ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                    >
                      click here
                    </a>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;
