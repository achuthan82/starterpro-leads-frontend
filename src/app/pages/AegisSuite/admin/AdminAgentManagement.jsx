import RoleGuard from 'middleware/RoleGuard';
import AgentManagement from './AgentManagement';

const AdminAgentManagement = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <AgentManagement />
    </RoleGuard>
  );
};

export default AdminAgentManagement; 