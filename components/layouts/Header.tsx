"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import { authService } from "@/services/auth.service";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const [user, setUser] =
    useState<ReturnType<typeof authService.getUser>>(null);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const getInitials = () => {
    if (!user) {
      return "U";
    }

    const firstName = user.firstName?.trim() || "";
    const lastName = user.lastName?.trim() || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
      return firstName.slice(0, 2).toUpperCase();
    }

    return user.username
      .slice(0, 2)
      .toUpperCase();
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || "User";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center border-b border-[#e2e8f0] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition hover:bg-slate-50 hover:text-[#0f172a] lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Desktop title */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#0f172a]">
              Product Management
            </p>

            <p className="mt-0.5 text-xs text-[#94a3b8]">
              Manage your product inventory
            </p>
          </div>

          {/* Mobile title */}
          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-bold text-[#0f172a]">
              Products
            </p>

            <p className="truncate text-xs text-[#94a3b8]">
              Product Management
            </p>
          </div>
        </div>

        {/* Right - Logged in user */}
        <div className="flex items-center">
          <div className="flex items-center gap-3 rounded-xl p-1.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f46e5] text-xs font-bold text-white">
              {getInitials()}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-[#0f172a]">
                {displayName}
              </p>

              <p className="text-[11px] text-[#94a3b8]">
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}