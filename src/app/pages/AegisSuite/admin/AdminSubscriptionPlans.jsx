import RoleGuard from 'middleware/RoleGuard';
import SubscriptionPlans from './SubscriptionPlans';

const AdminSubscriptionPlans = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <SubscriptionPlans />
    </RoleGuard>
  );
};

export default AdminSubscriptionPlans; 