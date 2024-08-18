import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChangeUsernameForm } from "./change-username-form";
import ChangeRole from "@/components/shared/change-role";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingInfoItem from "./setting-info-item";
import { UpdateUserLicenseForm } from "@/components/shared/update-user-license";
import { userService } from "@/client/services/firestore-client-services";
import { headers } from "next/headers";

async function getUser(userId: string) {
  const res = await userService.fetchDoc(userId, headers());
  return res.data;
}

export default async function UserProfileSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  const userRes = await getUser(user.id);

  return (
    <div>
      <Header
        heading="Personal information"
        text="Information about your personal profile"
      />
      <Link
        href="/student/read"
        className="inline-block mb-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
      >
        &larr; Back to Reading Page
      </Link>
      <Separator className="my-4" />
      <div className="mx-2 flex gap-4 flex-col md:flex-row mb-40">
        <div className="w-full">
          <ChangeUsernameForm username={user.display_name} userId={user.id} />
          <SettingInfoItem
            title="Email"
            data={user.email!}
            verified={user.email_verified}
            showVerified
          />
          <SettingInfoItem
            title="Reading advantage level"
            data={user.cefr_level || "unknown"}
          />
          <SettingInfoItem
            title="Reading advantage XP"
            desc="The XP is used to level up."
            data={user.xp?.toString() || "0"}
          />
          <Button variant="secondary">Reset XP</Button>
          {userRes?.license_id ? (
            <SettingInfoItem
              title="License"
              badge="Active"
              desc="This id refers to the license that you have activated."
              data={userRes.license_id}
              verified={true}
              showVerified={true}
            />
          ) : (
            <UpdateUserLicenseForm
              username={user.display_name}
              userId={user.id}
            />
          )}
        </div>
        <ChangeRole
          className="md:w-[38rem]"
          userId={user.id}
          userRole={user.role}
        />
      </div>
    </div>
  );
}
