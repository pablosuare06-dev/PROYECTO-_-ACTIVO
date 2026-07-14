import { useState, useEffect } from 'react';

const CACHE_KEY = 'ip_filter_result';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { result, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return result;
  } catch {
    return null;
  }
}

function setCache(result) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ result, ts: Date.now() }));
  } catch {}
}

function isGoogleOrg(org = '') {
  const lower = org.toLowerCase();
  return lower.includes('as15169') || lower.includes('google');
}

export function useIpFilter() {
  const [status, setStatus] = useState(() => getCached() ?? 'loading');

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      console.log('[useIpFilter] Using cached result:', cached);
      return;
    }

    console.log('[useIpFilter] Fetching IP location...');

    let timeoutId;
    const controller = new AbortController();

    timeoutId = setTimeout(() => {
      console.log('[useIpFilter] Timeout - allowing access');
      controller.abort();
      setCache('allowed');
      setStatus('allowed');
    }, 5000);

    Promise.race([
      fetch('https://ipinfo.io/json', { signal: controller.signal })
        .then(r => {
          if (!r.ok) throw new Error(`Status ${r.status}`);
          return r.json();
        }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Fetch timeout')), 4000)
      )
    ])
      .then(data => {
        clearTimeout(timeoutId);
        console.log('[useIpFilter] Response:', data);

        const country = data.country || '';
        const org = data.org || '';
        const isGoogle = isGoogleOrg(org);
        const isVenezuela = country === 'VE';

        console.log('[useIpFilter] Country:', country, 'Is Google:', isGoogle, 'Is Venezuela:', isVenezuela);

        const result = (country && !isGoogle && isVenezuela) ? 'allowed' : (!country ? 'allowed' : 'blocked');
        console.log('[useIpFilter] Result:', result);

        setCache(result);
        setStatus(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.log('[useIpFilter] Error fetching:', error.message);
        setCache('allowed');
        setStatus('allowed');
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return status;
}
