"use client";

import Link from "next/link";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useScopedI18n } from "@/locales/client";
import { Icons } from "./icons";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { Role } from "@/server/models/enum";
import {
  Ghost,
  GraduationCap,
  LogOut,
  School,
  Settings,
  ShieldAlert,
  UserCircle,
} from "lucide-react";

interface UserAccountNavProps {
  user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const t = useScopedI18n("components.userAccountNav");
  const [isLoading, setIsLoading] = useState(false);
  // const isDevelopment = process.env.NODE_ENV === "development";
  const isDevelopment = false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.display_name || null,
            image: user.picture || null,
          }}
          className="h-8 w-8 border-2 border-[#E5E7EB] rounded-full cursor-pointer"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.display_name && (
              <p className="font-medium">{user.display_name}</p>
            )}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
            <Badge
              variant="secondary"
              className="text-xs text-white bg-green-500 w-fit uppercase"
            >
              {user.role} Role
            </Badge>
          </div>
        </div>
        {
          // Only show if user is not completed the level test
          user.level === 0 && (
            <Link href="/level">
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400">
                <ShieldAlert className="mr-2 h-4 w-4" />
                <span>Level Test</span>
                <Badge className="ml-2 text-white bg-red-500">
                  Must complete
                </Badge>
              </DropdownMenuItem>
            </Link>
          )
        }

        {
          // Only show if user is not verified
          !user.email_verified && (
            <Link href="/settings/user-profile">
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-400">
                <ShieldAlert className="mr-2 h-4 w-4" />
                <span>Verify Email</span>
              </DropdownMenuItem>
            </Link>
          )
        }

        <DropdownMenuSeparator />
        {/* Student */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Student Routes</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <Link href="/student/read">
                <DropdownMenuItem>
                  <Icons.book className="mr-2 h-4 w-4" />
                  <span>Learner Home</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/student/history">
                <DropdownMenuItem>
                  <Icons.record className="mr-2 h-4 w-4" />
                  <span>History</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {
          // Only show if user is a teacher, admin or system admin
          (user.role === Role.TEACHER ||
            user.role === Role.ADMIN ||
            user.role === Role.SYSTEM ||
            isDevelopment) && (
            <Link href="/teacher/dashboard">
              <DropdownMenuItem>
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Teacher Dashboard</span>
              </DropdownMenuItem>
            </Link>
          )
        }

        {
          // Only show if user is an admin or system admin
          (user.role === Role.ADMIN ||
            user.role === Role.SYSTEM ||
            isDevelopment) && (
            <Link href="/admin/dashboard">
              <DropdownMenuItem>
                <School className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            </Link>
          )
        }

        {
          // Only show if user is a system admin
          (user.role === Role.SYSTEM || isDevelopment) && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>System Routes</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <Link href="/system/dashboard">
                    <DropdownMenuItem>
                      <Ghost className="mr-2 h-4 w-4" />
                      <span>System Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/system/license">
                    <DropdownMenuItem>
                      <Icons.class className="mr-2 h-4 w-4" />
                      <span>License</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )
        }
        <DropdownMenuSeparator />
        <Link href="/settings/user-profile">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            {t("settings")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={async (event) => {
            event.preventDefault();
            setIsLoading(true);
            await signOut({ callbackUrl: `/` });
            setIsLoading(false);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
