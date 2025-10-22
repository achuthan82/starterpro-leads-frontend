import RoleGuard from 'middleware/RoleGuard';
import PurchaseHistory from './PurchaseHistory';

const AdminPurchaseHistory = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <PurchaseHistory />
    </RoleGuard>
  );
};

export default AdminPurchaseHistory; 