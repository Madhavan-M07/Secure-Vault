import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../features/dashboard/components/DashboardLayout';
import DashboardOverview from '../features/dashboard/components/DashboardOverview';
import DocumentsView from '../features/dashboard/components/DocumentsView';
import SharedView from '../features/dashboard/components/SharedView';
import ActivityView from '../features/dashboard/components/ActivityView';
import SecurityView from '../features/dashboard/components/SecurityView';
import SettingsView from '../features/dashboard/components/SettingsView';

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();

  const renderActiveView = () => {
    switch (location.pathname) {
      case '/documents':
        return <DocumentsView />;
      case '/shared':
        return <SharedView />;
      case '/activity':
        return <ActivityView />;
      case '/security':
        return <SecurityView />;
      case '/settings':
        return <SettingsView />;
      case '/dashboard':
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return <DashboardLayout>{renderActiveView()}</DashboardLayout>;
}
