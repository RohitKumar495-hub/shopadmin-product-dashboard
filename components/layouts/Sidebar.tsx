"use client";

import { LogOut, ShoppingBag, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();

  const handleLogout = () => {
    authService.logout();

    toast.success("Logged out successfully");

    onClose();
    router.replace("/login");
  };

  const handleProductsClick = () => {
    router.push("/products");
    onClose();
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
          flex h-dvh w-64 flex-col
          bg-[#0f172a] text-white
          transition-transform duration-300
          lg:static lg:z-auto lg:h-screen
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header / Logo */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4f46e5]">
              <ShoppingBag size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white">
                ShopAdmin
              </h1>

              <p className="truncate text-xs text-slate-400">
                Product Management
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <button
            type="button"
            onClick={handleProductsClick}
            className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-3
              text-sm font-medium transition
              ${
                pathname.startsWith("/products")
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <ShoppingBag size={18} />

            <span>Products</span>
          </button>
        </nav>

        {/* Logout - always stays at bottom */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}