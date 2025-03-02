"use client"
import { HeroUIProvider } from "@heroui/react"
import { AdminProvider } from './context';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-black text-gray-100">
        <HeroUIProvider>
          <main className="flex-grow">
            {children}
          </main>
        </HeroUIProvider>
      </div>
    </AdminProvider>
  );
} 