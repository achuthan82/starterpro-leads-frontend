import RoleGuard from 'middleware/RoleGuard';
import ExpenseAndReports from './ExpenseAndReports';

const AdminExpenseAndReports = () => {
  return (
    <RoleGuard allowedRoles="admin">
      <ExpenseAndReports />
    </RoleGuard>
  );
};

export default AdminExpenseAndReports;

