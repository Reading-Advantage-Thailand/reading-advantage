import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
import React from "react";

type Props = {
  title: string;
  desc?: string;
  data: string;
  badge?: string;
  verified?: boolean;
  showVerified?: boolean;
};

export default function SettingInfoItem({
  title,
  desc,
  data,
  badge,
  verified,
  showVerified = false,
}: Props) {
  return (
    <div>
      <div className="text-sm font-medium mt-3">
        {title}
        {badge && (
          <Badge className="ml-2" variant="secondary">
            {badge}
          </Badge>
        )}
      </div>
      {desc && (
        <p className="text-[0.8rem] text-muted-foreground mt-2">{desc}</p>
      )}
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
      {/* {showVerified && verified && (
        <Button variant="secondary" size="sm">
          Resend verification email
        </Button>
      )} */}
    </div>
  );
}
