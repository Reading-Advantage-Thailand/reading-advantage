"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { set } from "lodash";
import { Clipboard, ClipboardCheck, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

type Props = {
  title: string;
  desc?: string;
  data: string;
  badge?: string;
  activated?: boolean;
  hidden?: boolean;
  isAbleToCopy?: boolean;
};

export default function LicenseInfoItem({
  title,
  desc,
  data,
  badge,
  hidden = false,
  isAbleToCopy = false,
}: Props) {
  const [isDataHidden, setIsDataHidden] = useState(hidden);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleDataVisibility = () => {
    setIsDataHidden(!isDataHidden);
  };

  return (
    <div>
      <div className="text-sm font-medium mt-3">
        {title}
        {badge && (
          <Badge
            className={cn(
              "ml-2",
              isAbleToCopy &&
                "cursor-pointer bg-green-600 text-white hover:bg-green-700"
            )}
            variant="secondary"
          >
            {isAbleToCopy ? (
              <span className="flex gap-1" onClick={handleCopy}>
                {isCopied ? "Copied" : "Copy"}
                {isCopied ? (
                  <ClipboardCheck size={16} />
                ) : (
                  <Clipboard size={16} />
                )}
              </span>
            ) : (
              badge
            )}
          </Badge>
        )}
      </div>

      {desc && (
        <p className="text-[0.8rem] text-muted-foreground mt-2">{desc}</p>
      )}

      <div className="flex justify-between items-center text-[0.8rem] text-muted-foreground rounded-lg border bg-card shadow px-3 py-2 my-2">
        <p>{isDataHidden ? "********-****-****-****-************" : data}</p>
        {hidden && (
          <span
            className="text-green-800 dark:text-green-300 flex items-center gap-1 hover:text-green-500 cursor-pointer"
            onClick={toggleDataVisibility}
          >
            {isDataHidden ? <Eye size={16} /> : <EyeOff size={16} />}
            {isDataHidden ? "Hidden" : "Visible"}
          </span>
        )}
      </div>
    </div>
  );
}
