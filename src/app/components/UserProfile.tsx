import { User } from 'lucide-react';

export function UserProfile() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right hidden sm:block">
        <div className="text-sm font-medium text-gray-900">Student User</div>
        <div className="text-xs text-gray-500">student@mail.utoronto.ca</div>
      </div>
      <div className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center">
        <User size={20} className="text-white" />
      </div>
    </div>
  );
}
