"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = authService.getToken();

    if (!token) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`
      );
      return;
    }

    setAuthenticated(true);
    setChecking(false);
  }, [pathname, router]);

  if (checking || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={26}
            className="animate-spin text-[#4f46e5]"
          />

          <p className="text-sm text-[#64748b]">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}