import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/admin/unanswered" className="hover:underline">
                  Unanswered Questions
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Back to Site
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <div className="container mx-auto">
          <p>Admin Dashboard &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
} 