import { useEffect, useState } from 'react';

export const useIpLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Using ipapi.co service (free tier) with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to fetch location');

        const data = await response.json();

        setLocation({
          country_code: data.country_code || null,
          country_name: data.country_name || null,
          city: data.city || null,
          region: data.region || null,
          ip: data.ip || null,
          timezone: data.timezone || null
        });

        setError(null);
      } catch (err) {
        setError(err.message);
        // Default to Venezuela in case of error to not block Venezuelan users
        setLocation({
          country_code: 'VE',
          country_name: 'Venezuela',
          city: null,
          region: null,
          ip: null,
          timezone: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const isVenezuelan = location?.country_code === 'VE';

  return {
    location,
    loading,
    error,
    isVenezuelan
  };
};
