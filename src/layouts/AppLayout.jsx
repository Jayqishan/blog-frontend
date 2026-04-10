import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }) {
  const { toast, clearToast } = useAuth();

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>
      <div className="noise"></div>
      <Navbar />
      <main className="main">{children}</main>
      <Toast toast={toast} onClear={clearToast} />
    </div>
  );
}
