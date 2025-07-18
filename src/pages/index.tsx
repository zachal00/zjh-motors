import { useRouter } from 'next/router';
import { useEffect } from 'react';
import WebsiteContent from './website';
import AdminDashboard from './admin/dashboard';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /admin/dashboard if the path is /admin
    if (router.pathname === '/admin') {
      router.push('/admin/dashboard');
    }
  }, [router.pathname]);

  // Render WebsiteContent for the main page
  if (router.pathname === '/') {
    return <WebsiteContent />;
  }

  // Render AdminDashboard for /admin/dashboard
  if (router.pathname === '/admin/dashboard') {
    return <AdminDashboard />;
  }

  // Fallback for other paths (e.g., 404 or other specific pages)
  return (
    &lt;div&gt;
      &lt;h1&gt;Page Not Found&lt;/h1&gt;
      &lt;p&gt;The requested page could not be found.&lt;/p&gt;
    &lt;/div&gt;
  );
}