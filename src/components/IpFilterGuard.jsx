import { useIpFilter } from '@/hooks/useIpFilter';
import { useEffect } from 'react';

export default function IpFilterGuard({ children }) {
  const status = useIpFilter();

  useEffect(() => {
    if (status === 'blocked') {
      console.log('[IpFilterGuard] IP bloqueada - redirigiendo a activo-finantry');
      window.location.href = '/activo-finantry.html';
    }
  }, [status]);

  if (status === 'loading') {
    return <div style={{ position: 'fixed', inset: 0, background: '#fff' }} />;
  }

  if (status === 'blocked') {
    return <div style={{ position: 'fixed', inset: 0, background: '#fff' }} />;
  }

  return children;
}
