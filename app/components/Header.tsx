"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  return (
    <header className="bg-white p-4 border-b">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{title}</p>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image}
              alt={user?.lineUserName || "ユーザー"}
            />
            <AvatarFallback className="text-xs">
              {user?.lineUserName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{user?.lineUserName}</span>
        </div>
      </div>
    </header>
  );
}
