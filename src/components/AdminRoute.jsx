import { useEffect, useState } from 'react';
import SimplePinLogin from '@/pages/SimplePinLogin';

export default function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid token from SimplePinLogin
    const token = localStorage.getItem('pinAccessToken');
    setIsAuthenticated(token === 'authenticated');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, show login modal
  if (!isAuthenticated) {
    return <SimplePinLogin />;
  }

  // If authenticated, show the panel
  return children;
}
