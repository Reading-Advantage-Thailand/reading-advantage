import { Header } from "@/components/header";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangeUsernameForm } from "./change-username-form";
import { UpdateUserLicenseForm } from "./update-user-license";
import { BadgeCheck } from "lucide-react";
import { Icons } from "@/components/icons";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChangeRole from "@/components/shared/change-role";

export default async function UserProfileSettingsPage() {
  const user = await getCurrentUser();

  // check if user is not logged in and redirect to signin page
  if (!user) {
    return redirect("/auth/signin");
  }

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
      <div className="mx-2 flex gap-4 flex-col md:flex-row">
        <div className="w-full">
          <ChangeUsernameForm username={user.display_name} userId={user.id} />
          <DisplaySettingInfo
            title="Email"
            data={user.email}
            verified={user.email_verified}
            showVerified
          />
          <DisplaySettingInfo
            title="Reading advantage level"
            data={user.cefr_level || "unknown"}
          />
          <DisplaySettingInfo
            title="Reading advantage XP"
            desc="The XP is used to level up."
            data={user.xp?.toString() || "0"}
          />
          <Button variant="secondary">Reset XP</Button>
          <UpdateUserLicenseForm
            username={user.display_name}
            userId={user.id}
          />
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

interface DisplaySettingInfoProps {
  title: string;
  desc?: string;
  data: string;
  badge?: string;
  verified?: boolean;
  showVerified?: boolean;
}

const DisplaySettingInfo: React.FC<DisplaySettingInfoProps> = ({
  title,
  desc,
  data,
  badge,
  verified,
  showVerified = false,
}) => (
  <>
    <div className="text-sm font-medium mt-3">
      {title}
      {badge && (
        <Badge className="ml-2" variant="secondary">
          {badge}
        </Badge>
      )}
    </div>
    {desc && <p className="text-[0.8rem] text-muted-foreground mt-2">{desc}</p>}
    <div className="flex justify-between items-center text-[0.8rem] text-muted-foreground rounded-lg border bg-card shadow px-3 py-2 my-2">
      <p>{data}</p>
      {showVerified && (
        <div className="flex items-center gap-1">
          {verified ? (
            <span className="text-green-800 dark:text-green-300 flex items-center gap-1">
              <BadgeCheck size={16} />
              Verified
            </span>
          ) : (
            <span className="text-red-800 dark:text-red-300 flex items-center gap-1">
              <Icons.unVerified size={16} />
              Not verified
            </span>
          )}
        </div>
      )}
    </div>
    {showVerified && verified && (
      <Button variant="secondary" size="sm">
        Resend verification email
      </Button>
    )}
  </>
);
