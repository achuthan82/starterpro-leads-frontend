import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { 
  PencilIcon, 
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserGroupIcon,
  // XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import SharedSidebar from '../components/SharedSidebar';
import { Card } from 'components/ui';
import adminService from 'utils/adminService';
import { useDisclosure } from 'hooks';
import ReactPaginate from 'react-paginate';
import UserModal from './UserModal';
import { toast } from 'sonner';
import { Spinner } from 'components/ui';
const UserManagement = () => {
  const randomColors = [
    "#0a2463", "#f4d03f", "#5ab453", "#92c933", "#FF2ECF", "#E000AD", "#FFA71A", "#FF4F1A",
    "#384766", "#506877", "#3D4E70", "#4A4A4F", "#6D7EA1", "#70838F", "#B8008C", "#FF75DF"
  ];
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  console.log(users)
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('0');
  const [selectedStatus, setSelectedStatus] = useState('all');
  // const [currentPage, setCurrentPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [editData, setEditData] = useState(null)
  const [currentPage, setCurrentPage] = useState(0); 
  const [inviteLoadingId, setInviteLoadingId] = useState(null)
  const [statusLoadingId, setStatusLoadingId] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState(null)
  const rowsPerPage = 10; 

  const [userCounts, setUserCounts] = useState({
    active: 0,
    inactive: 0
  });

  const [isOpen, {open, close}] = useDisclosure(false)
  // Modal states

  // Define fetchUsers with useCallback before using it in useEffect
  // const fetchUsers = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const params = {
  //       page: currentPage,
  //       // limit: 10,
  //     };

  //     if (searchTerm) params.search = searchTerm;
  //     if (selectedRole !== 'all') params.role = selectedRole;
  //     if (selectedStatus !== 'all') params.status = selectedStatus;
      
  //     console.log('Fetching users with params:', params);
  //     const response = await adminService.getUsers(params);
  //     console.log('Users API response:', response);
      
  //     // Handle different response formats
  //     let usersData = [];
  //     let totalPagesCount = 1;
  //     let totalUsersCount = 0;
      
  //     if (response.data) {
  //       usersData = Array.isArray(response.data) ? response.data : [];
  //       // Check for pagination object first, then fallback to other formats
  //       if (response.pagination) {
  //         totalPagesCount = Math.ceil(response.pagination.total / response.pagination.per_page);
  //         totalUsersCount = response.pagination.total;
  //       } else {
  //         totalPagesCount = response.totalPages || response.total_pages || Math.ceil((response.total || usersData.length) / 10);
  //         totalUsersCount = response.total || usersData.length;
  //       }
  //     } else if (Array.isArray(response)) {
  //       usersData = response;
  //       totalUsersCount = response.length;
  //     } else if (response.users) {
  //       usersData = Array.isArray(response.users) ? response.users : [];
  //       if (response.pagination) {
  //         totalPagesCount = Math.ceil(response.pagination.total / response.pagination.per_page);
  //         totalUsersCount = response.pagination.total;
  //       } else {
  //         totalPagesCount = response.totalPages || response.total_pages || Math.ceil((response.total || usersData.length) / 10);
  //         totalUsersCount = response.total || usersData.length;
  //       }
  //     }
      
  //     console.log('Processed users data:', usersData);
  //     console.log('Total pages calculated:', totalPagesCount);
  //     console.log('Total users count:', totalUsersCount);
  //     setUsers(usersData);
  //     setTotalPages(totalPagesCount);
  //     setPaginatedData(totalUsersCount);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
      
  //     // Handle authentication errors
  //     if (error.status === 401 || error.message?.includes('login')) {
  //       console.log('Authentication error - redirecting to login');
  //       navigate('/login');
  //       return;
  //     }
      
  //     setUsers([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [currentPage, selectedRole, selectedStatus, searchTerm, navigate]);
  const fetchUsers = useCallback(
  async (page = 1) => {
    try {
      setLoading(true);
     
       const params = {
        page,
        // limit: 10,
      };

      if (searchTerm) params.name = searchTerm;
      if (selectedRole !== '0') params.role_id  = parseInt(selectedRole);
      if (selectedStatus !== 'all' && selectedStatus !== '3') params.is_active  = parseInt(selectedStatus);
      if (selectedStatus === '3') params.registered = 0;

      console.log('Fetching users with params:', params);
      const response = await adminService.getUsers(params);
      console.log('Users API response:', response);

      let usersData = [];
      if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }

      setUsers(usersData);
      setPaginatedData(response.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.status === 401 || error.message?.includes('login')) {
        navigate('/login');
        return;
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  },
  [rowsPerPage, searchTerm, selectedRole, selectedStatus, navigate]
);

const fetchUserCounts = useCallback(async () => {
  try {
    const response = await adminService.getActiveInactiveCount();
    console.log('Counts API response:', response);


    setUserCounts({
      active: response.data.active || 0,
      inactive: response.data.inactive || 0
    });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    setUserCounts({ active: 0, inactive: 0 });
  }
}, []);

const handleInvite = (user) => {
     setInviteLoadingId(user.id)
     adminService.inviteAgain(user.id).then((response) => {
           console.log('response', response)
           if (response.status === 200) {
              toast.success('Invitation sent successfully')
            } else {
              toast.error('Please Try Again Later')
            }
     }).catch((error) => {
      toast.error(error)
     }).finally(() => {
      setInviteLoadingId(null)
     })
}

const handleStatusChange = (user, newStatus) => {
  const isActive = newStatus === 'active';
  const action = isActive ? 'activate' : 'deactivate';
  
  setConfirmationData({
    user,
    action,
    isActive,
    message: `Are you sure you want to ${action} ${user.name}? This will ${isActive ? 'enable' : 'disable'} their access to the system.`
  });
  setShowConfirmation(true);
};

const confirmStatusChange = async () => {
  if (!confirmationData) return;
  
  const { user, isActive } = confirmationData;
  setStatusLoadingId(user.id);
  
  try {
    const response = await adminService.makeUserActiveInactive(user.id, isActive);
    console.log('Status change response:', response);
    
    if (response.status === 200 || response.success) {
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      // Refresh the users list
      fetchUsers(currentPage + 1);
      // Refresh user counts
      fetchUserCounts();
    } else {
      toast.error('Failed to update user status. Please try again.');
    }
  } catch (error) {
    console.error('Error updating user status:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status === 404) {
      toast.error('User not found.');
    } else {
      toast.error(error.response?.data?.message || 'Failed to update user status. Please try again.');
    }
  } finally {
    setStatusLoadingId(null);
    setShowConfirmation(false);
    setConfirmationData(null);
  }
};

const cancelStatusChange = () => {
  setShowConfirmation(false);
  setConfirmationData(null);
};

// Handle escape key to close modal
useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && showConfirmation) {
      cancelStatusChange();
    }
  };

  if (showConfirmation) {
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  return () => {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = 'unset';
  };
}, [showConfirmation]);
useEffect(() => {
  fetchUserCounts();
}, [fetchUserCounts]);


  const handleEdit = (user) => {
       setEditData(user)
       open()
  }
  // useEffect(() => {
  //   // Check if we have a valid token before making API calls
  //   const token = localStorage.getItem('authToken');
  //   if (!token || token === 'authenticated') {
  //     console.log('No valid token found, redirecting to login');
  //     navigate('/shieldnest/login');
  //     return;
  //   }
    
  //   fetchUsers();
  // }, [fetchUsers, navigate]);
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token || token === 'authenticated') {
      navigate('/login');
      return;
    }

    fetchUsers(currentPage + 1);
  }, [fetchUsers, currentPage, navigate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchUsers]);




  /*const handleStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      await adminService.updateUserStatus(userId, newStatus);
      fetchUsers(); // Refresh the list
      alert(`User status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };*/



  const getStatusBadge = (status) => {
    const statusCheck = (status.is_active === true && status.registered === true) ? 1 : (status.is_active === false) ? 2 : (status.registered === false) ? 3 : 2
    const statusClasses = {
      1: {name: 'active', color: 'bg-green-600 text-white'},
      2: {name: 'inactive', color: 'bg-red-600 text-white'},
      3: {name: 'pending', color: 'bg-yellow-500 text-white'},
      // 4: {name: 'banned', color: 'bg-gray-600 text-white'}
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[statusCheck]?.color || 'bg-gray-100 text-gray-800'}`}>
       {statusClasses[statusCheck]?.name?.charAt(0).toUpperCase() + statusClasses[statusCheck]?.name?.slice(1) || ''}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const u_data = {
      1:{ role:'admin', color:'bg-[#0a2463] text-white'},
      2:{ role:'agent', color:'bg-[#f4d03f] text-white'},
      3:{ role:'manager', color:'bg-gray-100 text-gray-800'},
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u_data[role]?.color || 'bg-gray-100 text-gray-800'}`}>
        {u_data[role]?.role?.charAt(0).toUpperCase() + u_data[role]?.role?.slice(1) || ''}
      </span>
    );
  };

  // const activeUsers = users.filter(u => u.is_active).length;
  // console.log(activeUsers)
  // const inactiveUsers = users.filter(u => !u.is_active).length;

  // Check if user is admin
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'admin') {
    navigate('/agent-dashboard');
    return null;
  }
  const handlePagination = (page) => {
    setCurrentPage(page.selected); // This triggers useEffect above
  };

    const CustomPagination = () => {
  if (!paginatedData) return null;

  const pageCount = Math.ceil(
    paginatedData.total / paginatedData.per_page
  );
  return (
    <ReactPaginate
    previousLabel="«"
    nextLabel="»"
    forcePage={currentPage}
    onPageChange={handlePagination}
    pageCount={pageCount || 1}
    breakLabel="..."
    containerClassName="flex space-x-2 mt-4 justify-end"
    pageClassName=""
    pageLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
    previousLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
    nextLinkClassName="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
    breakLinkClassName="px-4 py-2 border border-gray-300 rounded-full"
    activeLinkClassName="bg-[var(--color-atoll)] text-white"
  />
  );
};


//   useEffect(() => {
//   setCurrentPage(0);
//   fetchUsers(1);
// }, [searchTerm, selectedRole, selectedStatus]);
  console.log(paginatedData)

  return (
    <div className="flex h-screen bg-[var(--color-ecru-white)] dark:bg-gray-900">
      <SharedSidebar currentPath="/admin/users" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-atoll)] dark:text-blue-400">User Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your team members and their access permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={open}
                className="bg-[#f4d03f] text-white px-4 py-2 rounded-lg hover:bg-[#e6c035] transition-colors flex items-center space-x-2"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>Invite User</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className=" p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[0]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{userCounts?.active + userCounts?.inactive}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg1 rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className=" p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[1]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{userCounts?.active}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg2 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid oklch(57.7% 0.245 27.325)` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{userCounts?.inactive}</p>
                </div>
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            {/* <Card className="p-6 shieldnest-white-column" style={{ borderLeft: `5px solid ${randomColors[2]}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Agents</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{users.filter(u => u.role?.toLowerCase() === 'agent').length}</p>
                </div>
                <div className="w-12 h-12 shieldnest-bg3 rounded-full flex items-center justify-center">
                  <UserPlusIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card> */}
          </div>

          {/* Filters and Search */}
          <Card className="p-6 mb-6 bg-white dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-atoll)] focus:border-[var(--color-atoll)]"
                />
              </div>

              <div className="sm:w-48">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75150b] focus:border-[#75150b]"
                >
                  <option value="0">All Roles</option>
                  <option value="1">Admin</option>
                  {/* <option value="manager">Manager</option> */}
                  <option value="2">Agent</option>
                </select>
              </div>

              <div className="sm:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#75150b] focus:border-[#75150b]"
                >
                  <option value="all">All Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                  <option value="3">Pending</option>
                  {/* <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option> */}
                </select>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden shieldnest-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role & Status
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Territory
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {(() => {
                              const color = randomColors[users.indexOf(user) % randomColors.length];
                              return (
                                <div
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: color }}
                                >
                                  <span className="text-white font-medium text-sm">
                                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                  </span>
                                </div>
                              );
                            })()}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                              {/* <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div> */}
                              <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {getRoleBadge(user.role_id)}
                            {getStatusBadge(user)}
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {user.territory || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLogin || user.last_login || 'Never'}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-[var(--color-atoll)] dark:text-blue-400 hover:text-[var(--color-atoll)] dark:text-blue-400/80 text-xs flex items-center space-x-1"
                            >
                              <PencilIcon className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {
                              !user.registered && <button
                              onClick={() => handleInvite(user)}
                              className="text-[var(--color-atoll)] dark:text-blue-400 hover:text-[var(--color-atoll)] dark:text-blue-400/80 text-xs flex items-center space-x-1"
                            > 
                            {
                              inviteLoadingId !== user.id ? <><EnvelopeIcon className="w-3 h-3" />
                              <span>Invite Again</span></> : <Spinner/>
                            }
                              
                            </button>
                            }
                            
                            {/* Active/Inactive buttons - only show for registered users */}
                            {user.registered && (
                              <>
                                {user.is_active ? (
                                  <button
                                    onClick={() => handleStatusChange(user, 'inactive')}
                                    disabled={statusLoadingId === user.id}
                                    className="text-red-600 hover:text-red-800 text-xs flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {statusLoadingId === user.id ? (
                                      <Spinner />
                                    ) : (
                                      <>
                                        <EyeSlashIcon className="w-3 h-3" />
                                        <span>Deactivate</span>
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(user, 'active')}
                                    disabled={statusLoadingId === user.id}
                                    className="text-green-600 hover:text-green-800 text-xs flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {statusLoadingId === user.id ? (
                                      <Spinner />
                                    ) : (
                                      <>
                                        <EyeIcon className="w-3 h-3" />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {/* {totalPages > 1 && (
              <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, paginatedData)} of {paginatedData} users
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Previous
                    </button> */}
                    
                    {/* Page Numbers */}
                    {/* <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${
                              currentPage === pageNum
                                ? 'bg-[var(--color-atoll)] text-white'
                                : 'border border-gray-300 hover:bg-gray-50 dark:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-700"
                    >
                      Last
                    </button>
                  </div> */}
                {/* </div>
              </div>
            )} */}
            <div className="p-4">
              <CustomPagination />
            </div>
          </Card>
          <UserModal isOpen={isOpen} close={close} open={open}  fetchUsers={fetchUsers} editData={editData} setEditData={setEditData} setCurrentPage={setCurrentPage}/>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div 
          className="fixed inset-0 bg-gray-600/65 bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelStatusChange}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirm {confirmationData.action}
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {confirmationData.message}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={statusLoadingId === confirmationData.user.id}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  confirmationData.isActive 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {statusLoadingId === confirmationData.user.id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  confirmationData.action.charAt(0).toUpperCase() + confirmationData.action.slice(1)
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 