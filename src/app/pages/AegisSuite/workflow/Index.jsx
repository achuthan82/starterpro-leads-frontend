import  { useState } from 'react'
import SharedSidebar from '../components/SharedSidebar';
import EmailText from './EmailText';
const Index = () => {
 const [loading] = useState(false)
 const [activeTab, setActiveTab] = useState('email-sms')
  return (
     <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
          {/* Sidebar */}
          <SharedSidebar currentPath="/workflow" />
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="border-b border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">
                    Workflows
                  </h1>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Manage your workflow
                  </p>
                </div>
              </div>
            </header>
    
            <main className="mt-1 flex-1 overflow-auto p-6">
              <div className="min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Tabs */}
                <nav className="border-b border-gray-200 bg-gray-50 px-8 dark:border-gray-700 dark:bg-gray-800">
                  <div className="-mb-px flex space-x-8 overflow-x-auto">
                    {[
                      { id: "email-sms", label: "Email/SMS" },
                      { id: "appointment", label: "Appointments" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "border-[#0a2463] text-[#0a2463] dark:border-[#f4d03f] dark:text-[#f4d03f]"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>
    
                {/* Content */}
                <div className="px-8 py-6">
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                      <span className="ml-2 text-gray-900 dark:text-gray-100">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <>
                      {
                        activeTab === 'email-sms' ? <EmailText/> : <EmailText/>
                      }
                    </>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
  )
}

export default Index
