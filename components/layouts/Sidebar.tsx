"use client";

import { LogOut, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/services/auth.service";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();

    toast.success("Logged out successfully");

    onClose();
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-60 shrink-0 flex-col
          bg-[#0f172a] text-white
          transition-transform duration-300
          lg:static lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4f46e5] shadow-lg shadow-indigo-950/30">
              <span className="text-sm font-bold">S</span>
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                ShopAdmin
              </p>

              <p className="text-[10px] text-slate-400">
                Product Management
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Workspace
          </p>

          <a
            href="/products"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl bg-[#4f46e5] px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-950/20 transition hover:bg-[#4338ca]"
          >
            <ShoppingBag size={18} />
            <span>Products</span>
          </a>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}