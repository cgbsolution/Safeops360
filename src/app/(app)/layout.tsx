"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth, type AuthUser } from "@/lib/auth-store";
import { api, getToken } from "@/lib/api";
import type { Industry } from "@/lib/industry";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const setIndustry = useAuth((s) => s.setIndustry);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<AuthUser>("/auth/me"),
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["industry-profile"],
    enabled: !!me?.organization_id,
    queryFn: () => api<{ industry: Industry }>("/organizations/me/industry-profile"),
  });

  useEffect(() => {
    if (me) setUser(me);
  }, [me, setUser]);

  useEffect(() => {
    if (profile?.industry) setIndustry(profile.industry);
  }, [profile, setIndustry]);

  return (
    <div className="flex min-h-screen app-surface">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-[1400px] p-6 md:p-8 animate-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
