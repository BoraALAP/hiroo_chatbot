import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/unanswered" className="block">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Unanswered Questions</h2>
            <p className="text-gray-800">
              Review and manage questions that couldn&apos;t be answered from the knowledge base.
            </p>
          </div>
        </Link>
        
        {/* Add more admin sections as needed */}
      </div>
    </div>
  );
} 