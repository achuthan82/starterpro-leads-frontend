import { useState } from 'react';
import { useNavigate } from 'react-router';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import SharedSidebar from './components/SharedSidebar';
import AegisSuiteLoader from './components/AegisSuiteLoader';
import RoleGuard from 'middleware/RoleGuard';

const InviteUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'agent',
    territory: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'admin') {
    navigate('/agent-dashboard');
    return null;
  }

  const territories = [
    'California - Los Angeles',
    'California - San Francisco',
    'New York - Manhattan',
    'New York - Brooklyn',
    'Texas - Houston',
    'Texas - Dallas',
    'Florida - Miami',
    'Florida - Orlando',
    'Illinois - Chicago',
    'Washington - Seattle'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, always succeed
    setIsSuccess(true);
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'agent',
      territory: '',
      message: ''
    });
    setIsSuccess(false);
    setError('');
  };

  if (isSuccess) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SharedSidebar currentPath="/admin/invite-user" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Sent!</h2>
              <p className="text-gray-600 mb-6">
                An invitation has been sent to <strong>{formData.email}</strong>. 
                They will receive an email with instructions to set up their account.
              </p>
              <div className="space-y-3">
                <button
                  onClick={resetForm}
                  className="w-full px-4 py-2 bg-[var(--color-atoll)] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Send Another Invitation
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go to User Management
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles="admin">
      <div className="flex h-screen bg-gray-50">
        <SharedSidebar currentPath="/admin/invite-user" />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Invite New User</h1>
              <p className="text-gray-600 mt-2">
                Send an invitation to a new user to join your ShieldNest team.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <XMarkIcon className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                    >
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="territory" className="block text-sm font-medium text-gray-700 mb-2">
                      Territory
                    </label>
                    <select
                      id="territory"
                      name="territory"
                      value={formData.territory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                    >
                      <option value="">Select a territory</option>
                      {territories.map((territory) => (
                        <option key={territory} value={territory}>
                          {territory}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                    placeholder="Add a personal message to the invitation email..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-[var(--color-atoll)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <AegisSuiteLoader size="sm" text="" />
                        <span className="ml-2">Sending Invitation...</span>
                      </>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
};

export default InviteUser; 