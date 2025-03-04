import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input, Select, SelectItem } from "@heroui/react";

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
      <Input
        type="text"
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search questions..."
        startContent={<MagnifyingGlassIcon className="h-5 w-5 text-default-400" />}
        variant="bordered"
      />
      
      <Select
        selectedKeys={new Set([statusFilter])}
        onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
        variant="bordered"
        placeholder="Select status"
      >
        <SelectItem key="all">All Statuses</SelectItem>
        <SelectItem key="pending">Pending</SelectItem>
        <SelectItem key="added_to_kb">Added to KB</SelectItem>
        <SelectItem key="answer_sent">Answer Sent</SelectItem>
      </Select>
      
      <Select
        selectedKeys={new Set([emailFilter])}
        onSelectionChange={(keys) => setEmailFilter(Array.from(keys)[0] as string)}
        variant="bordered"
        placeholder="Select email status"
      >
        <SelectItem key="all">All Email Status</SelectItem>
        <SelectItem key="with_email">With Email</SelectItem>
        <SelectItem key="without_email">Without Email</SelectItem>
        <SelectItem key="email_sent">Email Sent</SelectItem>
        <SelectItem key="email_not_sent">Email Not Sent</SelectItem>
      </Select>
    </div>
  );
} 