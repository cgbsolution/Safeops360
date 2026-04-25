"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, LogOut, Search, Settings, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-store";
import { clearTokens } from "@/lib/api";
import { toast } from "@/lib/use-toast";
import { INDUSTRY_LABELS } from "@/lib/industry";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppHeader() {
  const { user, industry, reset } = useAuth();
  const router = useRouter();

  function handleLogout() {
    clearTokens();
    reset();
    toast({ title: "Signed out", description: "See you next shift.", variant: "success" });
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 text-sm">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted">
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="hidden sm:flex sm:flex-col sm:leading-tight">
          <span className="font-semibold">{user?.organization_name ?? "Your organization"}</span>
          {industry && (
            <Link
              href="/industry"
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              {INDUSTRY_LABELS[industry]} · edit profile
            </Link>
          )}
        </div>
      </div>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search audits, permits, incidents…"
          className="h-10 pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
          Ctrl K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback>{initials(user?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:flex sm:flex-col sm:leading-tight">
                <span className="text-sm font-semibold">{user?.full_name ?? "Guest"}</span>
                <span className="text-[11px] text-muted-foreground">{user?.role ?? "—"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="normal-case">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(user?.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {user?.full_name ?? "Guest"}
                  </span>
                  <span className="text-xs text-muted-foreground">{user?.email ?? ""}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.role && (
              <div className="px-2 pb-1.5">
                <Badge variant="info" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            )}
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserIcon className="h-4 w-4" /> Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
