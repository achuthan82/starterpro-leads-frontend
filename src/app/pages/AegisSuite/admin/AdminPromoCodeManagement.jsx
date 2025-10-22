import RoleGuard from 'middleware/RoleGuard';
import ManagePromoCode from './promo-codes/ManagePromoCode';

const AdminPromoCodeManagement = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <ManagePromoCode />
    </RoleGuard>
  );
};

export default AdminPromoCodeManagement;
