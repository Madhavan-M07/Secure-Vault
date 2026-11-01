import DashboardLayout from '../features/dashboard/components/DashboardLayout';
import AdminDashboardView from '../features/admin/components/AdminDashboardView';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminDashboardView />
    </DashboardLayout>
  );
}

