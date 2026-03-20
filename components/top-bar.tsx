"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function TopBar({ user, notificationCount = 0, onMenuClick }: TopBarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-[70px] shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-8">
      {/* Mobile Menu & Logo */}
      <div className="flex lg:hidden items-center gap-3 mr-2">
        <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
            <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
                <span className="font-black text-sm">C</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm hidden xs:block">Coordena</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Pesquisar..."
          className="pl-9 bg-gray-50 border-gray-200 text-sm placeholder:text-gray-400 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications */}
      <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5 text-gray-500" />
        {notificationCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {notificationCount}
          </span>
        )}
      </button>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right hidden sm:flex">
          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
          <span className="text-xs text-gray-400">{user.email}</span>
        </div>
        <Avatar className="h-10 w-10 border-2 border-gray-200">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}