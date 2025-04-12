


import { AdminProvider } from './context';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-primary-50">
      
          <main className="flex-grow">
            {children}
          </main>
         
      </div>
    </AdminProvider>
  );
} 