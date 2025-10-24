import { useState } from 'react';
import { Card } from 'components/ui';
import SharedSidebar from './components/SharedSidebar';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    desktop: true,
    marketing: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    // { id: 'account', name: 'Account', icon: '⚙️' },
    // { id: 'notifications', name: 'Notifications', icon: '🔔' },
    // { id: 'security', name: 'Security', icon: '🔒' },
    // { id: 'billing', name: 'Billing', icon: '💳' }
  ];

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      {/* Sidebar */}
      <SharedSidebar currentPath="/settings" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2463] dark:text-blue-400 dark:text-blue-400">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your account and preferences</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64">
            <Card className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#0a2463] text-white'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#0a2463] dark:text-blue-400 mb-6">Profile Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-[#0a2463] to-[#f4d03f] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">SW</span>
                    </div>
                    <div>
                      <button 
                        onClick={() => alert('Photo upload feature would open here')}
                        className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">First Name</label>
                      <input
                        type="text"
                        defaultValue="Sarah"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Wilson"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue="sarah.wilson@shieldnest.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue="(555) 123-4567"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                      />
                    </div>
                    {/* <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bio</label>
                      <textarea
                        rows={3}
                        defaultValue="Senior Insurance Agent with 8+ years of experience in life and property insurance."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                      />
                    </div> */}
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => alert('Profile changes saved successfully!')}
                      className="bg-[#0a2463] text-white px-6 py-2 rounded-lg hover:bg-[#0a2463]/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'account' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#0a2463] dark:text-blue-400 mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Information</h3>
                    <div className="bg-gradient-to-r from-[#0a2463] to-[#f4d03f] p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xl font-bold">Premium Plan</h4>
                          <p className="opacity-90">Access to all features and unlimited leads</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">$99</div>
                          <div className="opacity-90">per month</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Territory Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div>
                          <div className="font-medium">California</div>
                          <div className="text-sm text-gray-500">Primary territory</div>
                        </div>
                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div>
                          <div className="font-medium">Florida</div>
                          <div className="text-sm text-gray-500">Secondary territory</div>
                        </div>
                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div>
                          <div className="font-medium">Texas</div>
                          <div className="text-sm text-gray-500">Secondary territory</div>
                        </div>
                        <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Add new territory feature would open here')}
                      className="mt-4 text-[#0a2463] dark:text-blue-400 hover:text-[#0a2463] dark:text-blue-400/80 font-medium"
                    >
                      + Add Territory
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#0a2463] dark:text-blue-400 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Communication</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                        { key: 'sms', label: 'SMS Notifications', description: 'Receive text message alerts' },
                        { key: 'desktop', label: 'Desktop Notifications', description: 'Show browser notifications' },
                        { key: 'marketing', label: 'Marketing Communications', description: 'Receive product updates and offers' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[item.key]}
                              onChange={() => handleNotificationChange(item.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0a2463]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#0a2463] dark:text-blue-400 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#0a2463] focus:outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('Password updated successfully!')}
                      className="mt-4 bg-[#0a2463] text-white px-4 py-2 rounded-lg hover:bg-[#0a2463]/90 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                      <div>
                        <div className="font-medium">2FA Status</div>
                        <div className="text-sm text-gray-500">Add an extra layer of security to your account</div>
                      </div>
                      <button 
                        onClick={() => alert('2FA setup wizard would open here')}
                        className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'billing' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-[#0a2463] dark:text-blue-400 mb-6">Billing & Payments</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs font-bold">
                            VISA
                          </div>
                          <div>
                            <div className="font-medium">**** **** **** 4532</div>
                            <div className="text-sm text-gray-500">Expires 12/25</div>
                          </div>
                        </div>
                        <button className="text-[#0a2463] dark:text-blue-400 hover:text-[#0a2463] dark:text-blue-400/80 font-medium">
                          Update
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Invoices</h3>
                    <div className="space-y-3">
                      {[
                        { date: 'Nov 1, 2024', amount: '$99.00', status: 'Paid' },
                        { date: 'Oct 1, 2024', amount: '$99.00', status: 'Paid' },
                        { date: 'Sep 1, 2024', amount: '$99.00', status: 'Paid' }
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div>
                            <div className="font-medium">{invoice.date}</div>
                            <div className="text-sm text-gray-500">Premium Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{invoice.amount}</div>
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Settings; 