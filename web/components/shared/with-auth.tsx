import { cloneElement, ReactElement, ReactNode } from "react";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { User } from "next-auth";
import { Role } from "@/server/models/enum";
import UnauthorizedPage from "./unauthorized-page";

interface WithAuthProps {
  children: ReactElement;
  requiredRole?: Role;
  redirectToLevel?: boolean;
  redirectToRoleSelection?: boolean;
}

export interface BaseWithAuthProps {
  user: User & {
    id: string;
    email: string;
    display_name: string;
    role: Role;
    level?: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level?: string;
    expired_date: string;
    expired?: boolean;
  };
}

export default async function WithAuth({
  children,
  requiredRole,
  redirectToLevel = true,
  redirectToRoleSelection = true,
}: WithAuthProps) {
  const user = await getCurrentUser();

  // check if user is not logged in and redirect to signin page
  if (!user) {
    return redirect("/auth/signin");
  }

  // check if requiredRole is provided and user role is not included in requiredRole
  // then redirect to unauthorized page
  if (requiredRole && user.role !== requiredRole) {
    return <UnauthorizedPage />;
  }

  return cloneElement(children, { user });
}
