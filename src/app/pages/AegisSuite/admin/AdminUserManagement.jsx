import RoleGuard from 'middleware/RoleGuard';
import UserManagement from './UserManagement';

const AdminUserManagement = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <UserManagement />
    </RoleGuard>
  );
};

export default AdminUserManagement; 