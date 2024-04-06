import SettingInfo from "@/components/setting-info";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/session";
import { CardContent } from "@mui/material";
import { redirect } from "next/navigation";
import ResetDialog from "@/components/reset-xp-dialog";
import RoleSelected from "@/components/teacher/role-selected";

type Props = {};

export default async function UserProfileSettingsPage({}: Props) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/auth/signin");
  }
  if (user.cefrLevel === "" && user.role.includes('STUDENT') && !user.role.includes('TEACHER')) {
    return redirect("/level");
  }
  // if (user.cefrLevel === "" && user.role.includes('TEACHER')) {
  //   return redirect("/teacher/my-classes");
  // }

  return (
    <Card className="mt-4">
      <CardContent>
        <h3 className="text-xl mb-4 font-semibold">Personal Information</h3>
        <div className="grid lg:grid-flow-row-dense lg:grid-cols-3 gap-4">
          {/* <div className="lg:col-span-2">
                        <p>
                            Photo
                        </p>
                        <p className="text-muted-foreground" >
                            Upload a photo to personalize your account
                        </p>
                    </div>
                    <Avatar className="w-40 h-40">
                        {user.image ? (
                            <AvatarImage alt="Picture" src={user.image} referrerPolicy="no-referrer" />
                        ) : (
                            <AvatarFallback>
                                <span className="sr-only">{user.name}</span>
                                <Icons.user className="h-24 w-24" />
                            </AvatarFallback>
                        )}
                    </Avatar> */}
          <SettingInfo
            title="Username"
            description="The username is use to represent themselves on a platform."
            data={user.name}
            isEdit={true}
          />
          <SettingInfo
            title="Email"
            description={
              user.verified
                ? "Your email is verified"
                : "Your email is not verified. Please verify your email by clicking on the button"
            }
            data={user.email}
            isEdit={false}
            verifyButton={true}
            isVerified={user.verified}
          />
          <SettingInfo
            title="Password"
            description="You can change your password by clicking on the button"
            data="********"
            isEdit={true}
          />
          <SettingInfo
            title="Level"
            description="Reading advantage level of user"
            data={user.level.toString()}
            isEdit={false}
          />
          <SettingInfo
            title="Reset all XP progress"
            description="Reset your progress and take the level test again."
            data={<ResetDialog />}
            isEdit={false}
          />
          <SettingInfo
            title="Select role"
            description="Select your role as teacher, student or administrator."
            data={<RoleSelected userId={user.id} role={""}/>}
            isEdit={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
