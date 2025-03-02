import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  emailFilter: string;
  setEmailFilter: (filter: string) => void;
}

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  emailFilter,
  setEmailFilter
}: SearchFilterProps) {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="added_to_kb">Added to KB</option>
          <option value="answer_sent">Answer Sent</option>
        </select>
      </div>
      
      <div>
        <select
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
          className="block w-full pl-3 pr-10 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Email Status</option>
          <option value="with_email">With Email</option>
          <option value="without_email">Without Email</option>
          <option value="email_sent">Email Sent</option>
          <option value="email_not_sent">Email Not Sent</option>
        </select>
      </div>
    </div>
  );
} 