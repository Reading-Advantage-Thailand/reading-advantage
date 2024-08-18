import { UpdateUserLicenseForm } from "@/components/shared/update-user-license";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

export default async function ExpiredPage({}: Props) {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  return (
    <div className="flex justify-center">
      <Card className="md:w-[40rem]">
        <CardHeader>
          <CardTitle className="text-primary text-xl">License Update</CardTitle>
          <CardDescription>
            Update your license to continue using the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UpdateUserLicenseForm
            username={user.display_name}
            userId={user.id}
            redirectTo="/student/read"
          />
        </CardContent>
      </Card>
    </div>
  );
}
