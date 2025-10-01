"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Eye } from "lucide-react";

export default function BottomBar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "ホーム",
      isActive: pathname === "/",
    },
    {
      href: "/createEvent",
      icon: Plus,
      label: "作成",
      isActive: pathname === "/createEvent",
    },
    {
      href: "/myEvents",
      icon: Eye,
      label: "閲覧",
      isActive: pathname === "/myEvents",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                  item.isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  size={24}
                  className={`mb-1 ${
                    item.isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    item.isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
