"use client";
import Link from "next/link";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useScopedI18n } from "@/locales/client";
import { Icons } from "./icons";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { Role } from "@/server/models/enum";

interface UserAccountNavProps {
  user: User;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const t = useScopedI18n("components.userAccountNav");
  const [isLoading, setIsLoading] = useState(false);

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
      <DropdownMenuContent align="end" className="md:w-52">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium line-clamp-1">{user.display_name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground line-clamp-1">
              {user.email}
            </p>
            {/* Check if the user's email is verified */}
            {!user.email_verified && (
              <Link href="/settings/user-profile">
                <button className="w-[200px] text-start truncate text-sm text-red-500 flex items-center">
                  <Icons.unVerified className="inline-block mr-1 w-4 h-4" />
                  Not verified email
                </button>
              </Link>
            )}
            <div className="flex">
              <Badge
                className="bg-green-700 hover:bg-green-600"
                variant="secondary"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        {/* Role-based menu items */}
        {
          // Check if the user is a teacher, admin, or system
          (user.role === Role.TEACHER ||
            user.role === Role.ADMIN ||
            user.role === Role.SYSTEM) && (
            <DropdownMenuItem asChild>
              <Link href="/teacher/my-classes">Teacher dashboard</Link>
            </DropdownMenuItem>
          )
        }
        {
          // Check if the user is a student, teacher, admin, or system
          (user.role === Role.STUDENT ||
            user.role === Role.TEACHER ||
            user.role === Role.ADMIN ||
            user.role === Role.SYSTEM) &&
          user.cefr_level !== "" ? (
            <DropdownMenuItem asChild>
              <Link href="/student/read">Learner Home</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/level">Level Test</Link>
            </DropdownMenuItem>
          )
        }
        {
          // Check if the user is an admin or system
          (user.role === Role.ADMIN || user.role === Role.SYSTEM) && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard">Admin dashboard</Link>
            </DropdownMenuItem>
          )
        }
        {user.role === Role.SYSTEM && (
          <DropdownMenuItem asChild>
            <Link href="/system/dashboard">System dashboard</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/user-profile">{t("settings")}</Link>
        </DropdownMenuItem>
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
          {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
