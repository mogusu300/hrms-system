import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useSession() {
  const [session, setSession] = useState<{ employee_number: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          // Django line 431: Session contains 'employee_number'
          setSession(data.session);
        } else {
          setSession(null);
          router.push('/login');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  return { session, loading };
}
